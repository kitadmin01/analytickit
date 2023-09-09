"""
Created on Aug 26 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""


import os
import dask.dataframe as dd


# Specify the folder where your parquet files are stored
folder_path = './analytickit/crypto/s3data'

# List all files in the folder
all_files = os.listdir(folder_path)

# Filter only the parquet files
parquet_files = [f for f in all_files if f.endswith('.parquet')]

# Loop through all parquet files and convert them to JSON
for file_name in parquet_files:
    parquet_file_path = os.path.join(folder_path, file_name)
    json_file_path = os.path.join(folder_path, file_name.replace('.parquet', '.json'))

    # Read the parquet file
    ddf = dd.read_parquet(parquet_file_path)

    # Open the JSON file for writing
    with open(json_file_path, 'w') as f:
        f.write('[')

        # Write each partition of the Dask DataFrame to the JSON file
        for i in range(ddf.npartitions):
            partition = ddf.get_partition(i).compute()
            json_data = partition.to_json(orient='records')[1:-1]
            if i > 0:
                f.write(', ')
            f.write(json_data)

        f.write(']')

    # print(f'File {file_name} converted to JSON and saved in the same folder')

# print('All parquet files converted to JSON')
