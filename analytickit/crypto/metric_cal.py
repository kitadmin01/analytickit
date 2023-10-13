"""
Created on Aug 31 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""


import json
from logger_config import logger
import datetime
from collections import defaultdict
from typing import Tuple
from decimal import Decimal, InvalidOperation
from collections import Counter
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation

class MetricCalculator:
    """
    This class is used to calculate the metrics for the given data.
    """

    def __init__(self, data: dict, contract_address: str, token_address: str):
        self.data = data
        self.contract_address = contract_address
        self.token_address = token_address

    def calculate_dau(self):
        # Extract all the 'transactions' and 'token_transfers' data
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        token_transfers_data = [item for key, value in self.data.items() if 'token_transfers' in key for item in value]

        active_addresses = set()

        # Consider both from and to addresses in transactions and token transfers
        for record in transactions_data:
            active_addresses.add(record.get('from_address'))
            active_addresses.add(record.get('to_address'))

        for record in token_transfers_data:
            active_addresses.add(record.get('from_address'))
            active_addresses.add(record.get('to_address'))

        # Remove None values if any
        active_addresses.discard(None)

        return len(active_addresses)




    def calculate_contract_calls(self):
        # Extract the 'transactions' data
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        
        # Filter the transactions where the 'to_address' matches the provided contract_address
        contract_calls = [txn for txn in transactions_data if txn.get('to_address') == self.contract_address]

        return len(contract_calls)

    def calculate_average_gas_used(self):
        # Extract the 'transactions' data
        transactions_data = self.data.get('transactions', [])

        # If there are no transactions, return 0 to avoid division by zero
        if not transactions_data:
            return 0

        # Sum up all the 'receipt_gas_used' values
        try:
            total_gas_used = sum(int(txn.get('receipt_gas_used', 0)) for txn in transactions_data)
        except ValueError:
            # Handle cases where 'receipt_gas_used' cannot be converted to an integer
            # Depending on your use case, you might log an error, raise an exception, or perhaps use a default value
            raise ValueError("Encountered an invalid 'receipt_gas_used' value")

        # Return the average gas used per transaction
        return total_gas_used / len(transactions_data)


    def calculate_function_calls_count(self):
        # Initialize function_calls_count
        function_calls_count = 0

        # Loop through each key (file path) in self.data
        for file_path, transactions_data in self.data.items():
            # Check if the filepath indicates these are transaction data
            # (this check might need to be adjusted based on actual file paths)
            if 'transactions' in file_path:
                # Loop through each transaction record in the list
                for txn in transactions_data:
                    # Check for non-None and non-"0x" in 'input' field of transactions
                    if txn.get('input') and isinstance(txn.get('input'), str) and txn.get('input') != "0x":
                        function_calls_count += 1

        return {"count": function_calls_count}



    def calculate_total_tokens_transferred(self):
        # Initialize a variable to hold the total tokens transferred
        total_transfers = 0
        
        # Loop through each file's data in self.data
        for file_path, transfers in self.data.items():
            # Safely accumulate the count of transfers
            try:
                total_transfers += len(transfers)
            except TypeError as e:
                # Log issues with non-iterable transfers data
                print(f"Unexpected error in file {file_path}: {e}")
        
        return total_transfers



    def calculate_total_transactions(self):
        # Initialize a count for all transactions
        total_transactions = 0
        
        # Loop through all keys in self.data
        for key, transactions in self.data.items():
            # Ensure that transactions are in a list format
            if isinstance(transactions, list):
                # Add the number of transactions in the current list to the total count
                total_transactions += len(transactions)
            else:
                # Handle or log the error as per your project's requirements
                logger.error(f"Error: Data under {key} is not in list format")
                # or other error-handling mechanism

        return total_transactions



    def calculate_average_transaction_fee(self):
        """
        Calculate the average transaction fee from transaction data.
        
        Returns:
            float: The average transaction fee or 0 if there's no transaction data.
        """
        total_fee = 0
        total_transactions = 0
        
        # Loop through all data keys (file paths/identifiers)
        for data_key in self.data:
            # Each data_key has associated transaction data, loop through it
            for txn in self.data[data_key]:
                try:
                    # Add to the total_fee the product of gas_price and receipt_gas_used for this txn
                    total_fee += int(float(txn.get('gas_price', 0))) * int(float(txn.get('receipt_gas_used', 0)))
                    
                    # Increment total transaction count
                    total_transactions += 1
                    
                except ValueError as e:
                    # Optionally: Log this error to a file or monitoring system
                    print(f"Error calculating fee for a transaction: {e}")
                    # Decide: whether to continue, return, or break. Using continue to skip to the next iteration.
                    continue

        # Return average or 0 if no transactions were processed
        return total_fee / total_transactions if total_transactions > 0 else 0


    def calculate_total_transactions_from_address(self) -> dict:
        """
        Calculate the total number of transactions originating from each address.

        Returns:
            str: A JSON string containing the count of transactions per 'from' address.
        """
        address_count = self._extracted_from_calculate_total_transactions_address('from_address')
        return address_count

    def calculate_total_transactions_to_address(self) -> dict:
        """
        Calculate the total number of transactions sent to each address.

        Returns:
            str: A JSON string containing the count of transactions per 'to' address.
        """
        address_count = self._extracted_from_calculate_total_transactions_address('to_address')
        return address_count

    def _extracted_from_calculate_total_transactions_address(self, address: str) -> dict:
        """
        Helper function to aggregate transaction counts per specified address field.

        Args:
            address (str): The key to aggregate upon ('from_address' or 'to_address').
            
        Returns:
            dict: A dictionary containing the transaction count per address.
        """
        result = {}
        # Loop through all keys in data to get all transactions
        for parquet_key, transactions_data in self.data.items():
            # Check if key indicates transaction data
            if 'transactions' in parquet_key:
                for txn in transactions_data:
                    if address_data := txn.get(address):
                        result[address_data] = result.get(address_data, 0) + 1
        return result

    


    def _get_bin_label(self, bin_range):
        return f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH"

    def calculate_transaction_value_distribution(self) -> str:
        bins = [
            (0, 0.01e18),
            (0.01e18, 0.1e18),
            (0.1e18, 1e18),
            (1e18, 10e18),
            (10e18, 50e18),
            (50e18, 100e18),
            (100e18, 500e18),
            (500e18, 1000e18),
            (1000e18, 5000e18),
            (5000e18, 1e22),
        ]

        value_distribution = {self._get_bin_label(bin_range): 0 for bin_range in bins}

        # Loop through all keys in the data (each key represents a part)
        for transactions_data in self.data.values():
            # Loop through all transactions in each part
            for txn in transactions_data:
                try:
                    # Trying to convert value to int through Decimal
                    value = int(Decimal(txn.get('value', 0)))
                except ValueError as ve:
                    print(f"Failed to convert value to int: {txn.get('value')} due to {str(ve)}")
                    continue
                except Exception as e:
                    print(f"Unexpected error converting value: {str(e)}")
                    continue

                for bin_range in bins:
                    if bin_range[0] <= value < bin_range[1]:
                        value_distribution[self._get_bin_label(bin_range)] += 1
                        break

        return value_distribution
    


    def calculate_token_transfer_volume(self):
        total_volume = Decimal('0')
        
        # Iterating over each key-value pair in the data dictionary
        for key, transfers in self.data.items():
            for transfer in transfers:
                try:
                    # Convert value to Decimal and add to the total volume
                    total_volume += Decimal(transfer.get('value', '0'))
                except InvalidOperation as e:     
                    logger.error(f"Invalid value for transfer: {transfer}")

        return total_volume




    def most_active_token_addresses(self):
        # The counter will automatically keep track of counts for each address
        address_counts = Counter()

        # Loop through each partition of data
        for partition, transfers in self.data.items():
            # Loop through each transfer in the partition
            for transfer in transfers:
                from_address = transfer.get('from_address')
                to_address = transfer.get('to_address')

                # Increment count for from_address
                if from_address:
                    address_counts[from_address] += 1

                # Increment count for to_address
                if to_address:
                    address_counts[to_address] += 1

        # Get the most common addresses (e.g., top 10)
        most_common_addresses = address_counts.most_common(10)

        return dict(most_common_addresses)

    def calculate_token_transfer_volume(self):
        total_volume_wei = Decimal('0')
        total_volume_eth = Decimal('0')
        
        # Conversion factor from WEI to ETH
        wei_to_eth = Decimal('1e-18')
        
        # Iterating over each key-value pair in the data dictionary
        for key, transfers in self.data.items():
            for transfer in transfers:
                try:
                    # Convert value to Decimal and add to the total volume in WEI
                    total_volume_wei += Decimal(transfer.get('value', '0'))
                except InvalidOperation as e:     
                    logger.error(f"Invalid value for transfer: {transfer}")
        
        # Convert the total volume to ETH
        total_volume_eth = total_volume_wei * wei_to_eth

        return total_volume_eth


    def calculate_average_token_transfer_value(self):
        # Initialize variables
        total_value = 0
        total_count = 0
        
        # Iterate through all partitions in the data
        for partition, token_transfers_data in self.data.items():
            # Sum up all the token transfer values
            try:
                total_value += sum(int(float(transfer.get('value', 0)))
                                for transfer in token_transfers_data)
                # Keep track of the total number of token transfers
                total_count += len(token_transfers_data)
            except ValueError as ve:
                print(f"Error converting value to int in partition {partition}: {ve}")
        
        # Calculate the average value and convert from Wei to ETH
        ave_token_transfer_value = (total_value / total_count) / 1e18 if total_count > 0 else 0
        
        return ave_token_transfer_value


    def calculate_token_transfer_value(self):
        # Initialize a variable to hold the total value in WEI
        total_value_wei = Decimal('0')
        
        # Conversion factor from WEI to ETH
        wei_to_eth = Decimal('1e-18')

        # Iterate over each key-value pair in self.data
        for key, token_transfers_data in self.data.items():
            for transfer in token_transfers_data:
                try:
                    # Convert string to Decimal and accumulate the total value
                    total_value_wei += Decimal(transfer.get('value', '0'))
                except InvalidOperation as e:
                    logger.error(f"Invalid value for transfer: {transfer}, error: {str(e)}")

        # Convert total value to ETH from WEI
        total_value_eth = total_value_wei * wei_to_eth
            
        return total_value_eth




    def calculate_token_flow(self):
        """
        The "token_flow" is mapping of the transfers of a specific token between 
        sender and receiver addresses. This can be represented as a directed graph 
        where each edge signifies a token transfer and its weight is the amount 
        transferred. However, for simplicity, we can represent it as a JSON object 
        where each key is a tuple (from_address, to_address) and its value is the 
        total amount transferred between these two addresses.
        """
        # Dictionary to store the flow of tokens between addresses
        flow_dict = {}

        # Function to reformat the address
        def reformat_address(address):
            return '0x' + address[23:] if address and len(address) > 23 else address

        # Iterate through all keys in self.data
        for key, token_transfers_data in self.data.items():
            
            # Check if the key contains 'token_transfers'
            if 'token_transfers' not in key:
                continue
            
            for transfer in token_transfers_data:
                from_address = reformat_address(transfer.get('from_address'))
                to_address = reformat_address(transfer.get('to_address'))

                # safely convert value to integer
                try:
                    # Directly convert scientific notation to Decimal and convert to int
                    value = int(Decimal(transfer.get('value', '0')))
                except InvalidOperation as e:
                    print(f"Error converting value to int: {e}")
                    value = 0  # or whatever default/fallback value is appropriate
                
                # Use tuple (from_address, to_address) as the key, and add up the values
                flow_key = (from_address, to_address)
                if flow_key in flow_dict:
                    flow_dict[flow_key] += value
                else:
                    flow_dict[flow_key] = value

        # Convert the tuple keys into a more JSON-friendly format
        return [
            {"from": key[0], "to": key[1], "value": str(value)}
            for key, value in flow_dict.items()
        ]




    def calculate_token_transfer_value_distribution(self):
        # Define the bins for token transfer value distribution
        bins = [
            # ... (keeping your bins the same)
        ]

        # Dictionary to store the count of transfers in each bin
        distribution_dict = {
            f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH": 0 for bin_range in bins}

        # Loop through all token transfer lists in self.data
        for token_transfers in self.data.values():
            # Check each token transfer and update the appropriate bin in the distribution
            for transfer in token_transfers:
                try:
                    # Convert to float first, then to int to handle scientific notation
                    value = int(float(transfer.get('value', '0')))  # assuming the value is a string
                except ValueError as ve:
                    print(f"Error converting value to int: {ve}")
                    value = 0  # or an appropriate fallback value
                
                for bin_range in bins:
                    if bin_range[0] <= value < bin_range[1]:
                        distribution_dict[f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH"] += 1
                        break

        return distribution_dict


    def frequency_of_transactions(self):
        # Dictionary to hold the frequency of transactions by day
        freq_by_day = defaultdict(int)

        # Iterate through each file path and its corresponding transaction data
        for filepath, txn_data_list in self.data.items():
            # Check if 'txn_data_list' is a list and proceed
            if isinstance(txn_data_list, list):
                # Extracting the block_timestamp from the transactions
                for txn in txn_data_list:
                    # Check if the transaction type is as expected
                    if txn.get("type") == "transactions":
                        timestamp = MetricCalculator.safe_int_conversion(txn.get('block_timestamp', 0))
                        if timestamp:
                            # Convert the timestamp to a human-readable date
                            # Assuming timestamp is in milliseconds
                            date = MetricCalculator.custom_utcfromtimestamp(timestamp).date()
                            freq_by_day[str(date)] += 1

        return dict(freq_by_day)


    
    def custom_utcfromtimestamp(timestamp_ms):
        # Reference epoch
        epoch = datetime(1970, 1, 1)
        
        # Split the timestamp into seconds and milliseconds parts
        timestamp_s, ms = divmod(timestamp_ms, 1000)
        
        try:
            # Constructing datetime object from epoch + timedelta in seconds + timedelta in milliseconds
            return epoch + timedelta(seconds=timestamp_s) + timedelta(milliseconds=ms)
        except OverflowError:
            print(f"OverflowError with timestamp_ms: {timestamp_ms}, timestamp_s: {timestamp_s}, ms: {ms}")
            raise

    def safe_int_conversion(num_str):
        try:
            return int(float(num_str))
        except ValueError as ve:
            print(f"Failed to convert: {num_str}, due to: {str(ve)}")
        return 0


