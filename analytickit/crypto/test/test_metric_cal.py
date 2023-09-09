import unittest

from analytickit.crypto.metric_cal import MetricCalculator
import json


class TestMetricCalculator(unittest.TestCase):

    def setUp(self):
        # Sample Data
        self.sample_data = {
            'transactions': [
                {
                    "to_address": "0xb5046cb3dc1dedbd364514a2848e44c1de4ed147",
                    "from_address": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
                    "gas_price": 20,
                    "receipt_gas_used": "21000",
                    "value": 1.162693884e+202,
                    "input":"0x791ac94700000000000000000000000000000000000000000000000000000a0411dd1ebf000000000000000000000000000000000000\
                    0000000000000070638a1008328300000000000000000000000000000000000000000000000000000000000000a000000000000000000000000029c17908b798f75857e1556\
                    9a490e19855028d620000000000000000000000000000000000000000000000000000000064ec2db10000000000000000000000000000000000000000000000000000000000\
                    000002000000000000000000000000bde71cb88777b7cde1d2325dabeb44e55824b92c000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                    
                },
                {
                    "to_address": "0xa89ac93b23370472daac337e9afdf642543f3e57",
                    "from_address": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
                    "gas_price": 25,
                    "receipt_gas_used": "21000",
                    "value": 1.162693884e+202,
                },
                {
                    "to_address": "0xa89ac93b23370472daac337e9afdf642543f3e57",
                    "from_address": "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
                    "gas_price": 25,
                    "receipt_gas_used": "21000",
                    "value": 1.162693884e+202,
                },

            ],
            "token_transfers": [
                {
                    "to_address": "0x000000000000000000000000b1a2b43a7433dd150bb82227ed519cd6b142d382",
                }
            ]
        }

        self.sample_data1 = {
            'transactions': [
                {"tx_hash": "0x01", "value": 0.005e18},
                {"tx_hash": "0x02", "value": 0.02e18},
                {"tx_hash": "0x03", "value": 0.5e18},
                {"tx_hash": "0x04", "value": 1.5e18},
                {"tx_hash": "0x05", "value": 0.01e18},
                {"tx_hash": "0x06", "value": 20e18},
                {"tx_hash": "0x07", "value": 7000e18},
                # ... other transaction records
            ]
        }

        self.calculator = MetricCalculator(self.sample_data, "0xb5046cb3dc1dedbd364514a2848e44c1de4ed147", "0x000000000000000000000000b1a2b43a7433dd150bb82227ed519cd6b142d382")

    def test_calculate_dau(self):
        # Test calculate_dau function
        result = self.calculator.calculate_dau()
        self.assertEqual(result, 3)

    def test_calculate_dau_empty_data(self):
        # Test calculate_dau function with empty data
        self.calculator.data = {'transactions': [], 'token_transfers': []}
        result = self.calculator.calculate_dau()
        self.assertEqual(result, 0)

    def test_calculate_contract_calls(self):
        # Test calculate_contract_calls function
        result = self.calculator.calculate_contract_calls()
        self.assertEqual(result, 1) # Expecting one match from the sample_data

    def test_calculate_contract_calls_empty_data(self):
        # Test calculate_contract_calls function with empty data
        self.calculator.data = {'transactions': []}
        result = self.calculator.calculate_contract_calls()
        self.assertEqual(result, 0)

    def test_calculate_contract_calls_no_match(self):
        # Test calculate_contract_calls function with no matching 'to_address'
        self.calculator.contract_address = "0x9999999999999999999999999999999999999999"
        result = self.calculator.calculate_contract_calls()
        self.assertEqual(result, 0)

    def test_calculate_average_gas_used(self):
        # Test calculate_average_gas_used function
        result = self.calculator.calculate_average_gas_used()
        # From the sample_data, average = (21000 + 21000) / 2 = 21000
        self.assertEqual(result, 21000)

    def test_calculate_average_gas_used_empty_data(self):
        # Test calculate_average_gas_used function with empty data
        self.calculator.data = {'transactions': []}
        result = self.calculator.calculate_average_gas_used()
        self.assertEqual(result, 0)

    def test_calculate_average_gas_used_with_missing_field(self):
        # Test calculate_average_gas_used function where some transactions do not have 'receipt_gas_used' field
        self.calculator.data['transactions'][0].pop('receipt_gas_used', None)
        result = self.calculator.calculate_average_gas_used()
        # From the sample_data, average = (0 + 21000) / 2 = 10500
        self.assertEqual(result, 14000.0 )     

    def test_calculate_function_calls_count(self):
        # Test calculate_function_calls_count function
        result = self.calculator.calculate_function_calls_count()
        # From the sample_data, there's 1 transaction with 'input' field not equal to "0x"
        self.assertEqual(result, 1)

    def test_calculate_function_calls_count_empty_data(self):
        # Test calculate_function_calls_count function with empty data
        self.calculator.data = {'transactions': []}
        result = self.calculator.calculate_function_calls_count()
        self.assertEqual(result, 0)

    def test_calculate_function_calls_count_no_function_calls(self):
        # Test calculate_function_calls_count function where all transactions have 'input' field as "0x"
        for txn in self.calculator.data['transactions']:
            txn['input'] = "0x"
        result = self.calculator.calculate_function_calls_count()
        self.assertEqual(result, 0)   

        # Test calculate_total_transactions function
        result = self.calculator.calculate_total_transactions()
        # Based on the sample_data provided, the total transactions is 2
        self.assertEqual(result, 3)

    def test_calculate_total_transactions_empty_data(self):
        # Test calculate_total_transactions function with empty transactions data
        self.calculator.data = {'transactions': []}
        result = self.calculator.calculate_total_transactions()
        self.assertEqual(result, 0)

    def test_calculate_total_transactions_no_txn_data(self):
        # Test calculate_total_transactions function when 'transactions' key is missing in data
        self.calculator.data = {}
        result = self.calculator.calculate_total_transactions()
        self.assertEqual(result, 0)

    def test_calculate_average_transaction_fee(self):
        # Test calculate_average_transaction_fee function
        result = self.calculator.calculate_average_transaction_fee()
        expected_average = (20 * 21000 + 25 * 21000 + 25 * 21000) / 3
        self.assertEqual(result, expected_average)

    def test_calculate_average_transaction_fee_empty_data(self):
        # Test calculate_average_transaction_fee function with empty transactions data
        self.calculator.data = {'transactions': []}
        result = self.calculator.calculate_average_transaction_fee()
        self.assertEqual(result, 0)

    def test_calculate_average_transaction_fee_no_txn_data(self):
        # Test calculate_average_transaction_fee function when 'transactions' key is missing in data
        self.calculator.data = {}
        result = self.calculator.calculate_average_transaction_fee()
        self.assertEqual(result, 0)

    def test_calculate_average_transaction_fee_partial_data(self):
        # Test calculate_average_transaction_fee function when some transactions lack gas_price or receipt_gas_used
        self.calculator.data = {
            'transactions': [
                {
                    "tx_hash": "0x45k37b6b235l9bde85801e46f297b7f75f234173503af47d3c48b15691933e45",
                    "gas_price": 25
                    # Missing "receipt_gas_used"
                }
            ]
        }
        result = self.calculator.calculate_average_transaction_fee()
        self.assertEqual(result, 0)       


    def test_calculate_total_transactions_from_address(self):
        # Test calculate_total_transactions_from_address function
        result = json.loads(self.calculator.calculate_total_transactions_from_address())
        expected_result = {
            "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": 2,
            "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": 1
        }
        self.assertEqual(result, expected_result)

    def test_calculate_total_transactions_from_address_empty_data(self):
        # Test calculate_total_transactions_from_address function with empty transactions data
        self.calculator.data = {'transactions': []}
        result = json.loads(self.calculator.calculate_total_transactions_from_address())
        self.assertEqual(result, {})

    def test_calculate_total_transactions_from_address_no_txn_data(self):
        # Test calculate_total_transactions_from_address function when 'transactions' key is missing in data
        self.calculator.data = {}
        result = json.loads(self.calculator.calculate_total_transactions_from_address())
        self.assertEqual(result, {})        

    def test_calculate_total_transactions_to_address(self):
        # Test calculate_total_transactions__address function
        result = json.loads(self.calculator.calculate_total_transactions_to_address())
        expected_result = {
            "0xa89ac93b23370472daac337e9afdf642543f3e57": 2,
            "0xb5046cb3dc1dedbd364514a2848e44c1de4ed147": 1
        }
        self.assertEqual(result, expected_result)

        self.calculator.data = self.sample_data1 
        expected_result = {
        '0.0-0.01 ETH': 1,
        '0.01-0.1 ETH': 2,
        '0.1-1.0 ETH': 1,
        '1.0-10.0 ETH': 1,
        '10.0-50.0 ETH': 1,
        '50.0-100.0 ETH': 0,
        '100.0-500.0 ETH': 0,
        '500.0-1000.0 ETH': 0,
        '1000.0-5000.0 ETH': 0,
        '5000.0-10000.0 ETH': 0,
    }

    def test_calculate_transaction_value_distribution_empty_data(self):
        expected_bins = [
        "0.0-0.01 ETH",
        "0.01-0.1 ETH",
        "0.1-1.0 ETH",
        "1.0-10.0 ETH",
        "10.0-50.0 ETH",
        "50.0-100.0 ETH",
        "100.0-500.0 ETH",
        "500.0-1000.0 ETH",
        "1000.0-5000.0 ETH",
        "5000.0-10000.0 ETH"
        ]
        # Test calculate_transaction_value_distribution function with empty transactions data
        self.calculator.data = {'transactions': []}
        result = self.calculator.calculate_transaction_value_distribution()
        result = json.loads(result)
        expected_result = {key: 0 for key in expected_bins}  # All bins have 0 counts
        self.assertEqual(result, expected_result)

    

    def test_calculate_transaction_value_distribution_no_txn_data(self):
        expected_bins = [
        "0.0-0.01 ETH",
        "0.01-0.1 ETH",
        "0.1-1.0 ETH",
        "1.0-10.0 ETH",
        "10.0-50.0 ETH",
        "50.0-100.0 ETH",
        "100.0-500.0 ETH",
        "500.0-1000.0 ETH",
        "1000.0-5000.0 ETH",
        "5000.0-10000.0 ETH"
        ]
        # Test calculate_transaction_value_distribution function when 'transactions' key is missing in data
        self.calculator.data = {}
        result = self.calculator.calculate_transaction_value_distribution()
        result = json.loads(result)
        expected_result = {key: 0 for key in expected_bins}  # All bins have 0 counts
        self.assertEqual(result, expected_result)


    def test_calculate_token_transfer_volume(self):
        # Test the calculate_token_transfer_volume function with sample token transfers data

        # Sample data
        self.calculator.data = {
            'token_transfers': [
                {'value': '100.5'},  # Converted to 100
                {'value': '200.25'},  # Converted to 200
                {'value': '50.9'},    # Converted to 50
                {},  # Edge case: token transfer without a value
                {'value': '300.75'}   # Converted to 300
            ]
        }
        
        # Calculate the sum of the sample data manually: 100 + 200 + 50 + 300 = 650
        expected_result = 650
        
        # Execute
        result = self.calculator.calculate_token_transfer_volume()

        # Assert
        self.assertEqual(result, expected_result)
        
    def test_calculate_token_transfer_volume_empty_data(self):
        # Test calculate_token_transfer_volume function with empty token transfers data
        self.calculator.data = {'token_transfers': []}
        
        # Expecting result to be 0 as there are no transfers
        expected_result = 0

        # Execute
        result = self.calculator.calculate_token_transfer_volume()

        # Assert
        self.assertEqual(result, expected_result)

    def test_most_active_token_addresses(self):
        # Test the most_active_token_addresses function with sample token transfers data

        # Sample data
        self.calculator.data = {
            'token_transfers': [
                {'from_address': 'address1', 'to_address': 'address2'},
                {'from_address': 'address1', 'to_address': 'address3'},
                {'from_address': 'address2', 'to_address': 'address1'},
                {'from_address': 'address3', 'to_address': 'address1'},
                {'from_address': 'address3', 'to_address': 'address2'}
            ]
        }
        
        # Expected result
        # address1 = 4  times, address2 = 3 times, address3 = 3 times
        expected_result = {'address1': 4, 'address2': 3, 'address3': 3}
        
        # Execute
        result = self.calculator.most_active_token_addresses()

        # Assert
        self.assertEqual(result, expected_result)

    def test_most_active_token_addresses_empty_data(self):
        # Test most_active_token_addresses function with empty token transfers data
        self.calculator.data = {'token_transfers': []}
        
        # Expecting result to be an empty dictionary as there are no transfers
        expected_result = {}

        # Execute
        result = self.calculator.most_active_token_addresses()

        # Assert
        self.assertEqual(result, expected_result)

    def test_calculate_average_token_transfer_value(self):
        # Test the calculate_average_token_transfer_value function with sample token transfers data

        # Sample data
        self.calculator.data = {
            'token_transfers': [
                {'value': '1000000000000000000'},   # 1 ETH in Wei
                {'value': '2000000000000000000'},   # 2 ETH in Wei
                {'value': '3000000000000000000'},   # 3 ETH in Wei
            ]
        }

        # Expected result
        # (1 ETH + 2 ETH + 3 ETH) / 3 = 2 ETH
        expected_result = 2.0

        # Execute
        result = self.calculator.calculate_average_token_transfer_value()

        # Assert
        self.assertEqual(result, expected_result)

    def test_calculate_average_token_transfer_value_empty_data(self):
        # Test the calculate_average_token_transfer_value function with empty token transfers data
        self.calculator.data = {'token_transfers': []}

        # Expected result to be 0 as there are no transfers
        expected_result = 0.0

        # Execute
        result = self.calculator.calculate_average_token_transfer_value()

        # Assert
        self.assertEqual(result, expected_result)

    def test_calculate_average_token_transfer_value_with_zeros(self):
        # Test the calculate_average_token_transfer_value function with transfers of zero value
        self.calculator.data = {
            'token_transfers': [
                {'value': '0'},
                {'value': '0'},
                {'value': '0'},
            ]
        }

        # Expected result to be 0 as all transfers are of zero value
        expected_result = 0.0

        # Execute
        result = self.calculator.calculate_average_token_transfer_value()

        # Assert
        self.assertEqual(result, expected_result)


    def test_calculate_token_flow(self):
        # Test the calculate_token_flow function with sample token transfers data

        # Sample data
        self.calculator.data = {
            'token_transfers': [
                {'from_address': 'addressA', 'to_address': 'addressB', 'value': '1000000000000000000'},   # 1 ETH in Wei
                {'from_address': 'addressA', 'to_address': 'addressB', 'value': '2000000000000000000'},   # 2 ETH in Wei
                {'from_address': 'addressB', 'to_address': 'addressC', 'value': '3000000000000000000'},   # 3 ETH in Wei
            ]
        }

        # Expected result
        # addressA to addressB: 1 ETH + 2 ETH = 3 ETH
        # addressB to addressC: 3 ETH
        expected_result = [
            {"from": "addressA", "to": "addressB", "value": "3000000000000000000"},  # 3 ETH in Wei
            {"from": "addressB", "to": "addressC", "value": "3000000000000000000"},  # 3 ETH in Wei
        ]

        # Execute
        result = self.calculator.calculate_token_flow()

        # Assert
        self.assertEqual(result, expected_result)

    def test_calculate_token_flow_empty_data(self):
        # Test the calculate_token_flow function with empty token transfers data
        self.calculator.data = {'token_transfers': []}

        # Expected result to be an empty list as there are no transfers
        expected_result = []

        # Execute
        result = self.calculator.calculate_token_flow()

        # Assert
        self.assertEqual(result, expected_result)

    def test_calculate_token_transfer_value_distribution(self):
        # Test the function with sample token transfers data

        # Sample data with token transfers of various values
        self.calculator.data = {
            'token_transfers': [
                {'value': '999999999999999'},    # Just below 0.001 ETH
                {'value': '1000000000000000'},   # Exactly 0.001 ETH
                {'value': '9000000000000000'},   # 0.009 ETH
                {'value': '50000000000000000'},  # 0.05 ETH
                {'value': '500000000000000000'}, # 0.5 ETH
                {'value': '1500000000000000000'},# 1.5 ETH
                {'value': '11000000000000000000'}, # 11 ETH
                {'value': '120000000000000000000'}, # 120 ETH
                {'value': '600000000000000000000'}, # 600 ETH
            ]
        }

        # Expected distribution result
        expected_result = {
            "0.0-0.001 ETH": 1,
            "0.001-0.01 ETH": 2,
            "0.01-0.1 ETH": 1,
            "0.1-1.0 ETH": 1,
            "1.0-10.0 ETH": 1,
            "10.0-100.0 ETH": 1,
            "100.0-500.0 ETH": 1,
            "500.0-1000.0 ETH": 1,
        }

        # Execute
        result = self.calculator.calculate_token_transfer_value_distribution()

        # Assert
        self.assertEqual(result, expected_result)

    def test_calculate_token_transfer_value_distribution_empty_data(self):
        # Test the function with empty token transfers data
        self.calculator.data = {'token_transfers': []}

        # Expected distribution result with all bins having 0 counts
        expected_result = {
            "0.0-0.001 ETH": 0,
            "0.001-0.01 ETH": 0,
            "0.01-0.1 ETH": 0,
            "0.1-1.0 ETH": 0,
            "1.0-10.0 ETH": 0,
            "10.0-100.0 ETH": 0,
            "100.0-500.0 ETH": 0,
            "500.0-1000.0 ETH": 0,
        }

        # Execute
        result = self.calculator.calculate_token_transfer_value_distribution()

        # Assert
        self.assertEqual(result, expected_result)

    

    def test_frequency_of_transactions_regular(self):
        # Regular scenario with transactions spread across different days
        self.calculator.data = {
            'transactions': [
                {'block_timestamp': 1678496400000},  # assuming this timestamp translates to 2023-03-11
                {'block_timestamp': 1678582800000},  # assuming this timestamp translates to 2023-03-12
                {'block_timestamp': 1678669200000}   # assuming this timestamp translates to 2023-03-13
            ]
        }

        expected_result = {
            '2023-03-11': 1,
            '2023-03-12': 1,
            '2023-03-13': 1,
        }

        result = self.calculator.frequency_of_transactions()
        self.assertEqual(result, expected_result)

    def test_frequency_of_transactions_same_day(self):
        # Edge case where multiple transactions occur on the same day
        self.calculator.data = {
            'transactions': [
                {'block_timestamp': 1678496400000},  # assuming this timestamp translates to 2023-03-11
                {'block_timestamp': 1678496440000},  # later on 2023-03-11
                {'block_timestamp': 1678496480000}   # even later on 2023-03-11
            ]
        }

        expected_result = {
            '2023-03-11': 3,
        }

        result = self.calculator.frequency_of_transactions()
        self.assertEqual(result, expected_result)

    def test_frequency_of_transactions_empty_data(self):
        # No transactions have taken place
        self.calculator.data = {'transactions': []}

        expected_result = {}

        result = self.calculator.frequency_of_transactions()
        self.assertEqual(result, expected_result)        

if __name__ == '__main__':
    unittest.main()
