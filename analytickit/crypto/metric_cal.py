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
from decimal import Decimal, InvalidOperation, getcontext, ROUND_DOWN, localcontext
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
        self.contract_address = contract_address.lower()
        self.token_address = token_address.lower()

    

    def average_effective_gas_price(self):
        '''
        Calculate the average effective gas price using receipt_effective_gas_price and return
        the value in Gwei. 1 Gwei = 10^9 Wei.

        The function iterates over all transactions, sums their effective gas prices,
        calculates the average, and converts this average to Gwei by dividing by 10^9.

        Returns:
            float: The average effective gas price in Gwei, or 0 if there's no transaction data.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        if not transactions_data:
            return Decimal('0')

        total_gas_price = sum(Decimal(transaction.get('receipt_effective_gas_price', '0')) for transaction in transactions_data)
        avg_gas_price = (total_gas_price / Decimal(len(transactions_data)) / Decimal('1e9')).quantize(Decimal('0.00000'), rounding=ROUND_DOWN)

        return avg_gas_price

    


    def median_effective_gas_price(self):
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

         # Check if there's any data
        if not transactions_data:
            return Decimal('0')


        # Extracting the 'receipt_effective_gas_price' for each transaction and converting to Decimal
        sorted_gas_prices = sorted([Decimal(transaction.get('receipt_effective_gas_price', '0')) for transaction in transactions_data])
        num_transactions = len(sorted_gas_prices)

        # If there's an even number of transactions, find the average of the two middle values
        if num_transactions % 2 == 0:
            mid1 = sorted_gas_prices[(num_transactions // 2) - 1]
            mid2 = sorted_gas_prices[num_transactions // 2]
            median_gas_price = (mid1 + mid2) / Decimal('2')
        else:
            # If there's an odd number of transactions, find the middle value
            median_gas_price = sorted_gas_prices[num_transactions // 2]

        # Convert to Gwei using Decimal for precision
        median_gas_price = (median_gas_price / Decimal('1e9')).quantize(Decimal('0.00000'), rounding=ROUND_DOWN)

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
    

    def gas_price_range(self):
        '''
        Calculate daily gas price range using receipt_effective_gas_price and return
        the range as (min, max) both in Gwei, 1 Gwei = 10^9 Wei.
        If no transactions data available, it returns (0, 0)
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        if not transactions_data:
            return (Decimal('0'), Decimal('0'))

        # Convert gas prices to Decimal and in Gwei
        gas_prices = [Decimal(transaction.get('receipt_effective_gas_price', '0')) / Decimal('1e9') for transaction in transactions_data]

        # Calculate min and max gas price, ensuring they fit the model field's constraints
        min_gas_price = min(gas_prices).quantize(Decimal('0.00000'), rounding=ROUND_DOWN)
        max_gas_price = max(gas_prices).quantize(Decimal('0.00000'), rounding=ROUND_DOWN)

        return (min_gas_price, max_gas_price)

    
    
    def total_daily_fees(self):
        '''
        Calculate the total fees paid in a day using receipt_effective_gas_price multiplied by receipt_gas_used.
        Return the value in Ether, 1 Ether = 10^18 Wei, rounded to 10 decimal places.
        If no transactions data available, it returns 0.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        # Check if there's any data
        if not transactions_data:
            return Decimal('0.0')

        # Calculate total fees for each transaction and sum them up, using Decimal for precision
        total_fees = sum(Decimal(transaction.get('receipt_effective_gas_price', 0)) * Decimal(transaction.get('receipt_gas_used', 0)) for transaction in transactions_data)

        # Convert total fees from Wei to Ether and round to 10 decimal places
        total_fees_in_ether = (total_fees / Decimal('1e18')).quantize(Decimal('.0000000001'), rounding=ROUND_DOWN)

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
        The result is given in Gwei, with improved precision using the Decimal class.
        Transactions data is iterated to extract 'receipt_effective_gas_price', convert it to Decimal,
        and then to Gwei by dividing by 1e9. The mean of these gas prices is calculated, followed by 
        the variance, and finally, the standard deviation using Decimal's sqrt() method.
        '''
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]

        if not transactions_data:
            return Decimal('0')

        # Ensure the decimal context is sufficient for sqrt operation
        getcontext().prec = 28

        gas_prices = [Decimal(transaction.get('receipt_effective_gas_price', '0')) / Decimal('1e9') for transaction in transactions_data]
        mean_gas_price = sum(gas_prices) / Decimal(len(gas_prices))
        variance = sum((price - mean_gas_price) ** 2 for price in gas_prices) / Decimal(len(gas_prices))
        std_dev = variance.sqrt()  # Calculate square root for standard deviation

        # Quantize the result to ensure it matches the database field's decimal places
        return std_dev.quantize(Decimal('0.00000'))


    def cumulative_gas_used(self):
            transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
            cumulative_gas_used = sum(transaction.get('gas', 0) for transaction in transactions_data)
            return cumulative_gas_used




    def calculate_cumulative_transaction_fees_adjusted(self):
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        if not transactions_data:
            return Decimal('0')

        # Calculate the sum of all transaction fees (in wei, converted to Ether within the calculation)
        total_fees = sum(Decimal(transaction.get('gas', 0)) * Decimal(transaction.get('receipt_effective_gas_price', '0')) for transaction in transactions_data) / Decimal('1e18')

        # Define the maximum value based on field constraints (30 digits total, 10 of which can be after the decimal)
        max_value = Decimal('9' * (30 - 10)) + Decimal('0.' + '9' * 10)

        # Adjust total fees to not exceed the max value and to adhere to the decimal place constraint
        if total_fees > max_value:
            total_fees = max_value
        else:
            # Ensure the total fees adhere to the decimal place constraint of 10 decimal places
            total_fees = total_fees.quantize(Decimal('0.0000000001'), rounding=ROUND_DOWN)

        return total_fees




    def cumulative_avg_gas_price(self):
        transactions_data = [item for key, value in self.data.items() if 'transactions' in key for item in value]
        if not transactions_data:
            return Decimal('0')

        total_gas_price = sum(Decimal(transaction.get('receipt_effective_gas_price', '0')) for transaction in transactions_data)
        total_transactions = len(transactions_data)

        # Calculate the average in wei, ensuring precision
        avg_gas_price_wei = total_gas_price / Decimal(total_transactions)

        # Convert average gas price from wei to "scaled ether" and adjust rounding to match DB field constraints.
        # Here, we scale the result by a factor of 10^6 for storage.
        scale_factor = Decimal('1e6')
        avg_gas_price_scaled = ((avg_gas_price_wei / Decimal('1e18')) * scale_factor).quantize(Decimal('0.00001'), rounding=ROUND_DOWN)

        return avg_gas_price_scaled





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
        
        # Handle case where gas_prices is empty or all prices are 0
        if not gas_prices or all(price == 0 for price in gas_prices):
            return {}  # Return an empty dictionary or any other default value you see fit
        
        # Find the range of gas prices
        try:
            min_gas_price = min(gas_prices)
            max_gas_price = max(gas_prices)
        except ValueError:
            return {}  # Return an empty dictionary if gas_prices is empty
        
        # Determine the width of each bin
        bin_width = (max_gas_price - min_gas_price) / bins if min_gas_price != max_gas_price else 1
        
        # Adjust for case where all gas prices are the same
        if bin_width == 0:
            bin_width = 1  # or any small value to avoid division by zero later
        
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

        Gas-Related Fields in transaction data:
        - gas: The amount of gas units that a transaction is allowed to consume.
        - gas_price: The price (in wei) that the sender is willing to pay per unit of gas.
        - max_fee_per_gas: The maximum fee per gas unit the sender is willing to pay.
        - max_priority_fee_per_gas: The maximum fee per gas unit to be sent to the miner, in case of congestion.
        - receipt_gas_used: Actual amount of gas units consumed by the transaction.
        - receipt_cumulative_gas_used: The total amount of gas used in the block when this transaction was processed.
        - receipt_effective_gas_price: The effective gas price paid by the sender.

        Returns the average gas used per transaction, rounded to a maximum of five decimal places.
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
            return 0.0

        # Sum up all the 'receipt_gas_used' values
        try:
            total_gas_used = sum(int(txn.get('receipt_gas_used', 0)) for txn in transactions_data)
        except ValueError:
            # Handle cases where 'receipt_gas_used' cannot be converted to an integer
            raise ValueError("Encountered an invalid 'receipt_gas_used' value")

        # Calculate the average gas used per transaction and round to five decimal places
        average_gas_used = round(total_gas_used / len(transactions_data), 5)

        # Ensure the result's absolute value is less than 10^15
        if abs(average_gas_used) >= 10**15:
            raise ValueError("Average gas used exceeds the maximum value allowed by the database field")

        return average_gas_used



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
        Calculate the average transaction fee from transaction data, ensuring the result
        does not exceed the maximum allowed value for fields with precision 20 and scale 5.
        
        Returns:
            Decimal: The average transaction fee rounded to five decimal places or 0 if there's no transaction data.
            The fee is calculated in Gwei and not converted to ETH.
        """
        total_fee = Decimal('0')
        total_transactions = 0
        
        # Loop through all data keys (file paths/identifiers)
        for data_key in self.data:
            # Each data_key has associated transaction data, loop through it
            for txn in self.data[data_key]:
                try:
                    # Add to the total_fee the product of gas_price and receipt_gas_used for this txn
                    total_fee += Decimal(txn.get('gas_price', 0)) * Decimal(txn.get('receipt_gas_used', 0))
                    
                    # Increment total transaction count
                    total_transactions += 1
                    
                except (ValueError, InvalidOperation) as e:
                    # Log this error
                    print(f"Error calculating fee for a transaction: {e}")
                    continue

        if total_transactions > 0:
            # Calculate the average
            average_fee = total_fee / Decimal(total_transactions)
            
            # Ensure the result fits within the database constraints
            max_allowed_value = Decimal('10') ** 15 - Decimal('1e-5')
            average_fee = min(average_fee, max_allowed_value).quantize(Decimal('1.00000'), rounding=ROUND_DOWN)
            
            return average_fee
        else:
            return Decimal('0')



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

        # Quantize the result to fit the max_digits and decimal_places constraints
        # Ensures that total_volume_eth has no more than 10 decimal places
        quantized_volume_eth = total_volume_eth.quantize(Decimal('0.0000000000'), rounding=ROUND_DOWN)

        # Ensure that the quantized value doesn't exceed the overall max_digits constraint
        # This step might not be strictly necessary if total_volume_wei is known to be within a reasonable range,
        # but it's included here for completeness and to ensure compliance with the field constraints.
        max_value_str = '9' * (30 - 10) + '.' + '9' * 10  # Constructs a string with 20 nines before the decimal point and 10 nines after
        max_allowed_value = Decimal(max_value_str)
        if quantized_volume_eth > max_allowed_value:
            # Handle cases where even after quantization, the value exceeds the maximum allowed value
            # This could involve logging a warning and adjusting the value or raising an error
            quantized_volume_eth = max_allowed_value  # Adjust as necessary

        return quantized_volume_eth



    def calculate_average_token_transfer_value(self):
        total_value = Decimal('0')
        total_count = 0
        
        for partition, token_transfers_data in self.data.items():
            for transfer in token_transfers_data:
                total_value += Decimal(transfer.get('value', '0'))
                total_count += 1
        
        ave_token_transfer_value = (total_value / Decimal(total_count) * Decimal('1e-18')).quantize(Decimal('0.0000000000'), rounding=ROUND_DOWN) if total_count > 0 else Decimal('0')
        
        return ave_token_transfer_value



    def calculate_token_transfer_value(self):
        total_value_wei = Decimal('0')
        wei_to_eth = Decimal('1e-18')

        for key, token_transfers_data in self.data.items():
            for transfer in token_transfers_data:
                total_value_wei += Decimal(transfer.get('value', '0'))

        total_value_eth = (total_value_wei * wei_to_eth).quantize(Decimal('0.0000000000'), rounding=ROUND_DOWN)
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
                        # Convert value from WEI to ETH and round to nearest whole number
                        value = round(Decimal(transfer.get('value', '0')) * wei_to_eth)
                    except InvalidOperation as e:
                        print(f"Error converting value to Decimal: {e}")
                        value = 0  # or whatever default/fallback value is appropriate
                    
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


