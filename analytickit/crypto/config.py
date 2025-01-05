"""
Created on Aug 25 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""


import configparser
import boto3
import json
import structlog
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

logger = structlog.get_logger(__name__)

class ConfigHolder:
    """
    This class reads configuration values from config.ini file
    """
    section_names = (
        "DB",
        "AWS"
  
    )

    def __init__(self, *file_names):
        """
        Initialize ConfigHolder object

        Parameters
        ----------

        *file_names : str
            Name of configuration file names

        Raises
        ------

        ValueError
            DESCRIPTION.

        Returns
        -------
        None.
        """
        parser = configparser.ConfigParser()
        parser.optionxform = str  # make option names case sensitive
        found = parser.read(file_names)

        if not found:
            logger.error(f"No config file found:{file_names}")
            raise ValueError(f"No config file found:{file_names}")

        for name in ConfigHolder.section_names:
            self.__dict__.update(parser.items(name))

    def get_db_config(self):
        #get db user/pass from secret
        secret_name = self.get_value('AWS', 'secret_name')
        region_name = self.get_value('AWS', 'region')

        secret = self.get_secret(secret_name, region_name)

        if secret is not None:
            self.logger.info(f"Found secret {secret}")
            db_username = secret['username']
            db_password = secret['password']

        return {
            'DB_HOST': self.get_value('Database', 'host'),
            'DB_PORT': self.get_value('Database', 'port'),
            'DB_NAME': self.get_value('Database', 'db_name'),
            'DB_USER': db_username,
            'DB_PASS': db_password
        }

    def get_value(self, key):
        """
        Return value for the given key

        Parameters
        ----------
        key : str
            key to retrieve the value

        Returns
        -------

        TYPE
            Value associated withe the key.

        """
        return self.__dict__.get(key)

    def set_value(self, key, value):
        """
        Set value for the given key. This function is used to change the
        default conig key-value pair. Primiarly used for functional test
        to load specific values.

        Parameters
        ----------
        key : str
            key to set the value

        value : str
            value to set

        Returns
        -------
        None.

        """
        self.__dict__[key] = value



    def get_secret(self, secret_name, region_name):
        # Create a Secrets Manager client
        client = boto3.client(service_name='secretsmanager', region_name=region_name)

        try:
            # Get the secret value
            response = client.get_secret_value(SecretId=secret_name)

        except NoCredentialsError as e:
            logger.error("Credentials not available:", e)
            return None
        except PartialCredentialsError as e:
            logger.error("Incomplete credentials provided:", e)
            return None
        except client.exceptions.ResourceNotFoundException as e:
            logger.error(f"The requested secret {secret_name} was not found",e)
            return None
        except client.exceptions.InvalidParameterException as e:
            logger.error(f"The parameter {secret_name} is not valid", e)
            return None
        except client.exceptions.InvalidRequestException as e:
            logger.error("The request was invalid due to:", e)
            return None
        except client.exceptions.InternalServiceError as e:
            logger.error("An error occurred on the server side:", e)
            return None

        # Depending on whether the secret is a string or binary, one of these fields will be populated
        if 'SecretString' in response:
            secret = response['SecretString']
        else:
            secret = response['SecretBinary']

        return json.loads(secret)

