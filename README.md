# envirodash
A dashboard hosting environmental data from RaspberryPI

Instructions

Connection to raspberry pi : https://www.circuitbasics.com/raspberry-pi-ds18b20-temperature-sensor-tutorial/
Install python packages.

Azure Tables doc : https://docs.microsoft.com/en-us/python/api/overview/azure/data-tables-readme?view=azure-python

A data factory copys the table data to a blob storage as csv.
You need to create a SAS token for the blob with read rights so that the html file reads data from there.

pip install azure-data-tables


The dashboard is at https://cventour.github.io
