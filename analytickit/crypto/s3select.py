import boto3
import json

def get_data_from_s3(bucket, key):
    s3 = boto3.client('s3')
    
    # SQL expression to select all data from the Parquet file
    expression = "SELECT * FROM s3object s"
    
    try:
        # Initiating the S3 select object content
        content_response = s3.select_object_content(
            Bucket=bucket,
            Key=key,
            Expression=expression,
            ExpressionType='SQL',
            InputSerialization={'Parquet': {}},
            OutputSerialization={'JSON': {}}
        )
        
        # Iterating over the S3 Select response and printing out the content
        for event in content_response['Payload']:
            if 'Records' in event:
                records = event['Records']['Payload'].decode('utf-8').strip().split('\n')
                for record in records:
                    try:
                        record_dict = json.loads(record)
                        print(record_dict)
                    except json.JSONDecodeError as je:
                        print(f"Error decoding JSON: {je}, Raw record: {record}")
                    except Exception as e:
                        print(f"Unexpected error: {e}")
    except Exception as e:
        print(f"Unable to retrieve data: {e}")

if __name__ == "__main__":
    BUCKET_NAME = 'aws-public-blockchain' # Replace with your bucket name
    KEY = 'v1.0/eth/transactions/date=2023-10-06/part-00000-b39b452e-502a-4d60-b78a-ebebf08649b7-c000.snappy.parquet'  # Replace with your object key
    
    get_data_from_s3(BUCKET_NAME, KEY)
