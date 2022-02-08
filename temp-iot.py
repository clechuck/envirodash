import os
import glob
import time
from datetime import datetime, timedelta
from azure.data.tables import TableServiceClient, ResourceTypes
from azure.core.credentials import AzureNamedKeyCredential, AzureSasCredential

#credential = AzureNamedKeyCredential("devstoreaccount1", "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==")
#table_service_client = TableServiceClient(endpoint="http://192.168.1.28:10002/devstoreaccount1", credential=credential)
#table_client = table_service_client.create_table(table_name='tempdata')

print ("[-] Creating Credential")
connection_string="DefaultEndpointsProtocol=https;AccountName=envdata;AccountKey=Vti0vFlt8HKTpJTuPoMg8G4P1weHiHIfvk6fz59q+HaWLVbFxdSqI6F5B4vvvJZbAcsZjwrSTz/IrYnOHxLiGw==;EndpointSuffix=core.windows.net"
print ("[-] Connecting to Table Service")
table_service_client = TableServiceClient.from_connection_string(conn_str=connection_string)
print ("[-] Connecting to Table")
table_client = table_service_client.get_table_client(table_name="temperaturedata")

# Use this only the first time you create the table to create the header lines 
# that will be used for the export in the Data Factory task.
#
#my_entity = {
#        u'PartitionKey': "Date",
#        u'RowKey': "Temperature"
#        }
#entity = table_client.create_entity(entity=my_entity)

os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
 
base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '10*')[0]
device_file = device_folder + '/temperature'
out_file = "/home/pi/temps.csv"
out = open(out_file,"a")
 

def read_temp_raw():
    f = open(device_file, 'r')
    lines = f.readlines()
    f.close()
    return lines

def read_temp():
    while True:
        lines = read_temp_raw()
        if len(lines) > 0:
            temp_c = float(lines[0]) / 1000.0
#            temp_f = temp_c * 9.0 / 5.0 + 32.0
#            return '{"temp": "'+str(temp_c)+'"}'
            today = datetime.now()
            now = today.strftime("%d/%m/%Y %H:%M")
            return float("{:.1f}".format(temp_c))
 

while True:
    temp = read_temp()
    now = datetime.now().strftime("%d-%m-%Y %H:%M")
    out.write("%s,%s\n" % (temp,now))
    out.flush()
    print(now,temp)
    my_entity = {
        'PartitionKey': str(int(time.time())),
        'DateTime': now,
        'RowKey': str(temp)
        }
    entity = table_client.create_entity(entity=my_entity)
    time.sleep(600)

    #SAS URL for Exported CSV
    #https://envdata.blob.core.windows.net/tempdata/temps.csv?sv=2020-10-02&st=2022-01-11T09%3A43%3A32Z&se=2022-12-31T09%3A43%3A00Z&sr=b&sp=r&sig=l%2B5vneBSig8LTuyeefnsSUoRG2gFF8P4ZFZcHOEEQ8A%3D

