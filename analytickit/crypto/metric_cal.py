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
from collections import Counter
import heapq 
import numpy
import collections


class MetricCalculator:
    """
    This class is used to calculate the metrics for the given data.
    """

    def __init__(self, data: dict, contract_address: str, token_address: str):
        self.data = data
        self.contract_address = contract_address
        self.token_address = token_address


    def average_effective_gas_price(self):
        '''
        Calculate average effective gas price using receipt_effective_gas_price and return
        the value in wei, 1 Gwei = 10^9 Wei
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Check if there's any data
        if not transactions_data:
            return 0

        # Extracting the 'receipt_effective_gas_price' from each transaction and converting to Gwei
        total_gas_price = sum(transaction.get('receipt_effective_gas_price', 0) for transaction in transactions_data)

        # Calculating the average and converting to Gwei
        avg_gas_price = total_gas_price / len(transactions_data) / 1e9

        return avg_gas_price
    

    
    def median_effective_gas_price(self):
        '''
        Calculate median effective gas price using receipt_effective_gas_price and return
        the value in Gwei, 1 Gwei = 10^9 Wei
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Check if there's any data
        if not transactions_data:
            return 0

        # Extracting the 'receipt_effective_gas_price' for each transaction
        sorted_gas_prices = sorted([transaction.get('receipt_effective_gas_price', 0) for transaction in transactions_data])

        median_gas_price = 0
        num_transactions = len(sorted_gas_prices)

        # If there's an even number of transactions, find the average of the two middle values
        if num_transactions % 2 == 0:
            mid1 = sorted_gas_prices[(num_transactions // 2) - 1]
            mid2 = sorted_gas_prices[num_transactions // 2]
            median_gas_price = (mid1 + mid2) / 2
        # If there's an odd number of transactions, find the middle value
        else:
            median_gas_price = sorted_gas_prices[num_transactions // 2]

        # Convert to Gwei
        median_gas_price = median_gas_price / 1e9

        return median_gas_price
    

    def gas_price_range(self):
        '''
        Calculate daily gas price range using receipt_effective_gas_price and return
        the range as (min, max) both in Gwei, 1 Gwei = 10^9 Wei.
        If no transactions data available, it returns (0, 0)
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Check if there's any data
        if not transactions_data:
            return (0, 0)

        # Extracting the 'receipt_effective_gas_price' for each transaction
        gas_prices = [transaction.get('receipt_effective_gas_price', 0) for transaction in transactions_data]

        # Finding minimum and maximum gas price
        min_gas_price = min(gas_prices) / 1e9
        max_gas_price = max(gas_prices) / 1e9

        return (min_gas_price, max_gas_price)
    
    
    def total_daily_fees(self):
        '''
        Calculate the total fees paid in a day using receipt_effective_gas_price multiplied by gas_used.
        Return the value in Ether, 1 Ether = 10^18 Wei.
        If no transactions data available, it returns 0.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Check if there's any data
        if not transactions_data:
            return 0

        # Calculate total fees for each transaction and sum them up
        total_fees = sum(transaction.get('receipt_effective_gas_price', 0) * transaction.get('gas_used', 0) for transaction in transactions_data)

        # Convert total fees from Wei to Ether
        total_fees_in_ether = total_fees / 1e18

        return total_fees_in_ether


    def change_in_average_gas_price(self, previous_day_data):
        '''
        Calculate the change in average gas price from the previous day to the current day.
        Returns the change in Gwei.
        If no transactions data available for either day, it returns None.
        '''
        current_day_transactions = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        previous_day_transactions = [item for key, value in previous_day_data.items() if 'transactions' in key for item in value]

        # Check if there's any data for the current day
        if not current_day_transactions:
            return None

        # Check if there's any data for the previous day
        if not previous_day_transactions:
            return None

        # Calculate average gas price for the current day
        total_current_day_gas_price = sum(transaction.get('receipt_effective_gas_price', 0) for transaction in current_day_transactions)
        avg_current_day_gas_price = total_current_day_gas_price / len(current_day_transactions) / 1e9

        # Calculate average gas price for the previous day
        total_previous_day_gas_price = sum(transaction.get('receipt_effective_gas_price', 0) for transaction in previous_day_transactions)
        avg_previous_day_gas_price = total_previous_day_gas_price / len(previous_day_transactions) / 1e9

        # Calculate the change in average gas price
        change = avg_current_day_gas_price - avg_previous_day_gas_price

        return change
    

    
    def transactions_count_by_gas_price_range(self):
        '''
        Calculate the number of transactions in different gas price ranges.
        Returns a dictionary with gas price ranges as keys and counts as values.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Define the gas price ranges in Gwei
        ranges = {
            "0-10 Gwei": (0, 10e9),
            "10-20 Gwei": (10e9, 20e9),
            "20-50 Gwei": (20e9, 50e9),
            "50-100 Gwei": (50e9, 100e9),
            "100+ Gwei": (100e9, float('inf'))
        }

        # Initialize a dictionary to store the counts
        counts_by_range = {key: 0 for key in ranges.keys()}

        # Count the transactions in each gas price range
        for transaction in transactions_data:
            gas_price = transaction.get('receipt_effective_gas_price', 0)
            for range_name, (min_price, max_price) in ranges.items():
                if min_price <= gas_price < max_price:
                    counts_by_range[range_name] += 1
                    break

        return counts_by_range


    def daily_percentile_analysis(self):
        '''
        Calculate daily percentiles for effective gas prices.
        Returns a dictionary with percentiles as keys and gas prices in Gwei as values.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Extract gas prices
        gas_prices = [transaction.get('receipt_effective_gas_price', 0) for transaction in transactions_data]

        # Check if there's any data
        if not gas_prices:
            return {}

        # Define the percentiles to compute
        percentiles = [1, 5, 25, 50, 75, 90, 95, 99]

        # Calculate the percentiles
        results = {}
        for percentile in percentiles:
            value = numpy.percentile(gas_prices, percentile) / 1e9  # convert to Gwei
            results[f"{percentile}th percentile"] = value

        return results


    def transactions_relative_to_previous_day_avg(self):
        '''
        Calculate the number of transactions with a gas price above and below the previous day's average.
        Returns a dictionary with two keys: 'above' and 'below' indicating the counts.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Check if there's any data or if previous_day_avg isn't set
        if not transactions_data or not hasattr(self, 'previous_day_avg'):
            return {"above": 0, "below": 0}

        above_count = sum(1 for transaction in transactions_data if transaction.get('receipt_effective_gas_price', 0) / 1e9 > self.previous_day_avg)
        below_count = len(transactions_data) - above_count

        # After determining the above and below count, set this day's average for future use
        self.previous_day_avg = self.average_effective_gas_price()

        return {"above": above_count, "below": below_count}


    def daily_standard_deviation(self):
        '''
        Calculate the daily standard deviation of the gas prices using receipt_effective_gas_price. 
        The result is given in Gwei.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Check if there's any data
        if not transactions_data:
            return 0

        # Extracting the 'receipt_effective_gas_price' from each transaction and converting to Gwei
        gas_prices = [transaction.get('receipt_effective_gas_price', 0) / 1e9 for transaction in transactions_data]

        # Calculate mean gas price
        mean_gas_price = sum(gas_prices) / len(gas_prices)

        # Calculate the variance
        variance = sum((price - mean_gas_price) ** 2 for price in gas_prices) / len(gas_prices)

        # Calculate the standard deviation
        std_dev = variance ** 0.5

        return std_dev


    def cumulative_gas_used(self):
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        return sum(transaction.get('gas', 0) for transaction in transactions_data)

    def cumulative_transaction_fees(self):
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        return sum(transaction.get('gas', 0) * transaction.get('receipt_effective_gas_price', 0) for transaction in transactions_data)

    def cumulative_avg_gas_price(self):
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        total_gas_price = sum(transaction.get('receipt_effective_gas_price', 0) for transaction in transactions_data)
        total_transactions = len(transactions_data)
        return total_gas_price / total_transactions if total_transactions > 0 else 0

    def cumulative_transactions_count(self):
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        return len(transactions_data)
    


    def gas_price_histogram(self, bins=10):
        '''
        Calculate a frequency distribution (histogram) of gas prices.
        
        Args:
        - bins (int): Number of intervals (bins) for the histogram. Default is 10.

        Returns:
        - A dictionary with bin intervals as keys and frequency counts as values.
        '''
        
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        
        # Extract the 'receipt_effective_gas_price' from each transaction
        gas_prices = [transaction.get('receipt_effective_gas_price', 0) for transaction in transactions_data]
        
        # Find the range of gas prices
        min_gas_price = min(gas_prices)
        max_gas_price = max(gas_prices)
        
        # Determine the width of each bin
        bin_width = (max_gas_price - min_gas_price) / bins
        
        # Create the bins and initialize their counts to 0
        bin_edges = [min_gas_price + i * bin_width for i in range(bins + 1)]
        histogram = collections.defaultdict(int)

        # Populate the histogram
        for price in gas_prices:
            for i in range(bins):
                if bin_edges[i] <= price < bin_edges[i + 1]:
                    histogram[(bin_edges[i], bin_edges[i + 1])] += 1
                    break

        converted_data = {f"{k[0]}_{k[1]}": v for k, v in histogram.items()}            
        return converted_data



    def calculate_dau(self): #old
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
        """
        Calculate and return the average gas used per transaction based on the input S3 data.
        - self.data: Dictionary with s3 keys as keys and transaction data as values.

        Gas-Related Fields in transaction data
        gas:The amount of gas units that a transaction is allowed to consume.
        Note: Transactions specify the maximum amount of gas they are willing to consume, and unused gas is refunded.

        gas_price:The price (in wei, where 1 ether = 10^18 wei) that the sender is willing to pay per unit of gas.
        Note: This is typical for legacy transactions (type 0x0). The user specifies a gas price, and the total transaction fee is gas_price * gas_used.
        
        max_fee_per_gas: The maximum fee per gas unit the sender is willing to pay.
        Note: Used in EIP-1559 transactions, where the user specifies a maximum they are willing to pay per gas unit.
        
        max_priority_fee_per_gas:The maximum fee per gas unit to be sent to the miner, in case of congestion.
        Note: Also used in EIP-1559 transactions, to determine how much of the total fee goes to the miner.

        receipt_gas_used:Actual amount of gas units consumed by the transaction.
        Note: At the end of execution, the actual gas used is calculated. The remaining (if any) of gas - receipt_gas_used is refunded.
        
        receipt_cumulative_gas_used:The total amount of gas used in the block when this transaction was processed.
        Note: Shows the accumulative gas used in the block up to and including this transaction.
        
        receipt_effective_gas_price:The effective gas price paid by the sender, considering base fee and priority fee.
        Note: Especially relevant in EIP-1559 transactions.
        """

        # Extract 'transactions' data from s3_data
        transactions_data = [
            txn_data
            for s3_key, txn_data_list in self.data.items()
            if 'transactions' in s3_key  # Only process keys related to transactions
            for txn_data in txn_data_list  # Extract transaction data from the list
        ]

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
            gas_price is calculated in Gwei and returned as Gwei. Not converted to ETH
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

    def _extracted_from_calculate_total_transactions_address(self, address: str, top_n: int = 10) -> dict:
            """
            Helper function to aggregate transaction counts per specified address field.
            It now returns the top_n addresses by transaction count.

            Args:
                address (str): The key to aggregate upon ('from_address' or 'to_address').
                top_n (int): Number of top addresses to return, default is 10.
                
            Returns:
                dict: A dictionary containing the transaction count per address for top N addresses.
            """
            result = {}
            # Loop through all keys in data to get all transactions
            for parquet_key, transactions_data in self.data.items():
                # Check if key indicates transaction data
                if 'transactions' in parquet_key:
                    for txn in transactions_data:
                        if address_data := txn.get(address):
                            result[address_data] = result.get(address_data, 0) + 1

            # Using heapq to efficiently get the top N addresses
            top_addresses = heapq.nlargest(top_n, result.items(), key=lambda x: x[1])

            return dict(top_addresses)

    


    def _get_bin_label(self, bin_range):
        return f"{bin_range[0]}-{bin_range[1]} ETH"

    def calculate_transaction_value_distribution(self) -> str:
            # Define bins in terms of ETH
            bins = [
                (0, 0.01),
                (0.01, 0.1),
                (0.1, 1),
                (1, 10),
                (10, 50),
                (50, 100),
                (100, 500),
                (500, 1000),
                (1000, 5000),
                (5000, 10000), 
            ]

            value_distribution = {self._get_bin_label(bin_range): 0 for bin_range in bins}

            # Loop through all keys in the data (each key represents a part)
            for transactions_data in self.data.values():
                # Loop through all transactions in each part
                for txn in transactions_data:
                    try:
                        # Convert value to ETH from WEI
                        value = Decimal(txn.get('value', 0)) * Decimal('1e-18')
                    except ValueError as ve:
                        print(f"Failed to convert value to Decimal: {txn.get('value')} due to {str(ve)}")
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
        
        # Conversion factor from WEI to ETH
        wei_to_eth = Decimal('1e-18')
        
        # Iterating over each key-value pair in the data dictionary
        for key, transfers in self.data.items():
            for transfer in transfers:
                try:
                    # Convert value from WEI to ETH and add to the total volume
                    total_volume += Decimal(transfer.get('value', '0')) * wei_to_eth
                except InvalidOperation as e:     
                    logger.error(f"Invalid value for transfer: {transfer}")

        return total_volume


    def most_active_token_addresses(self):
        # The counter will automatically keep track of counts for each address
        address_counts = Counter()

        # Loop through each partition of data
        for partition, transfers in self.data.items():
            # Check if the partition is related to token_transfers
            if 'token_transfers' in partition:
                # Loop through each transfer in the partition
                for transfer in transfers:
                    from_address = self.reformat_token_address(transfer.get('from_address'))
                    to_address = self.reformat_token_address(transfer.get('to_address'))

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


    # Function to reformat the address
    def reformat_token_address(self, address):
        return '0x' + address[23:] if address and len(address) > 23 else address


    def calculate_token_flow(self, top_n: int = 10):
            """
            The "token_flow" is a mapping of the transfers of a specific token between 
            sender and receiver addresses. This can be represented as a directed graph 
            where each edge signifies a token transfer and its weight is the amount 
            transferred. However, for simplicity, we can represent it as a JSON object 
            where each key is a tuple (from_address, to_address) and its value is the 
            total amount transferred between these two addresses.

            Now returns top_n token flows by value.
            """
            # Dictionary to store the flow of tokens between addresses
            flow_dict = {}

            # Conversion factor from WEI to ETH
            wei_to_eth = Decimal('1e-18')

            # Iterate through all keys in self.data
            for key, token_transfers_data in self.data.items():
                
                # Check if the key contains 'token_transfers'
                if 'token_transfers' not in key:
                    continue
                
                for transfer in token_transfers_data:
                    from_address = self.reformat_token_address(transfer.get('from_address'))
                    to_address = self.reformat_token_address(transfer.get('to_address'))

                    # safely convert value to integer in ETH
                    try:
                        # Convert value from WEI to ETH
                        value = Decimal(transfer.get('value', '0')) * wei_to_eth
                    except InvalidOperation as e:
                        print(f"Error converting value to Decimal: {e}")
                        value = Decimal('0')  # or whatever default/fallback value is appropriate
                    
                    # Use tuple (from_address, to_address) as the key, and add up the values
                    flow_key = (from_address, to_address)
                    if flow_key in flow_dict:
                        flow_dict[flow_key] += value
                    else:
                        flow_dict[flow_key] = value

            # Extract top_n flows
            top_flows = heapq.nlargest(top_n, flow_dict.items(), key=lambda x: x[1])
            
            # Convert the tuple keys into a more JSON-friendly format
            return [
                {"from": key[0], "to": key[1], "value": str(value)}
                for key, value in top_flows
            ]




    def calculate_token_transfer_value_distribution(self):
        # Define the bins for token transfer value distribution
        bins = [
            (0, 1e15),            # 0 to 0.001 ETH
            (1e15, 1e16),        # 0.001 to 0.01 ETH
            (1e16, 1e17),        # 0.01 to 0.1 ETH
            (1e17, 1e18),        # 0.1 to 1 ETH
            (1e18, 10 * 1e18),   # 1 to 10 ETH
            (10 * 1e18, 100 * 1e18),  # 10 to 100 ETH
            (100 * 1e18, 500 * 1e18),  # 100 to 500 ETH
            (500 * 1e18, 1e21)      # 500 ETH to 1000 ETH
        ]

        # Dictionary to store the count of transfers in each bin
        distribution_dict = {
            f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH": 0 for bin_range in bins}

        # Loop through all data in self.data and check if it's related to token_transfers
        for partition, token_transfers in self.data.items():
            if 'token_transfers' in partition:
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
            # Check if the file path indicates transaction data and if 'txn_data_list' is a list
            if 'transactions' in filepath and isinstance(txn_data_list, list):
                # Extracting the date from the transactions
                for txn in txn_data_list:
                    date_str = txn.get('date', '')
                    if date_str:
                        try:
                            # Convert the date string to a datetime object and back to string to ensure a consistent format
                            date = datetime.strptime(date_str, "%Y-%m-%d").date()
                            freq_by_day[str(date)] += 1
                        except ValueError as e:
                            print(f"Could not convert date: {e}")

        return dict(freq_by_day)


