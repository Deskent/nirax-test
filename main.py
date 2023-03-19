import os
import re
from typing import TypeAlias

import requests
from dotenv import load_dotenv

from exceptions import ApiKeyException, DataException

load_dotenv()

API_KEY: str = os.getenv('API_KEY')

Orders: TypeAlias = dict[str, list[dict]]
Item: TypeAlias = dict[str, str]


class Worker:
    BASE_URL = "https://api.berg.ru/v1.0"

    def __init__(self, api_key: str):
        self.api_key: str = api_key

    def get_stock_with_filter_key(
            self,
            items: list[Item],
            filter_key: str = 'resource_article',
            analogs: bool = False
    ) -> Orders:
        """
        Return goods list by articles as JSON

        :param items: The List of the items contains article data
        :param filter_key: The key to filter by. Default: resource_article
        :param analogs: If True - add query analogs=1 to querystring
        :return: response from API as JSON
        """

        items_query: str = '&'.join(
            f'items[{index}][{filter_key}]={clean_article(elem[filter_key])}'
            for index, elem in enumerate(items)
        )
        payload: dict = {
            "method": "GET",
            "suffix": "/ordering/get_stock",
            "query": items_query
        }
        if analogs:
            payload.update(query=f'{payload["query"]}&analogs=1')
        return self._send_request(payload)

    def _send_request(self, payload: dict) -> dict | list:
        """
        Add base url to head of payload url. Add api key to tail of payload url.
        Send request to url using payload method.

        :param payload: Dictionary with HTTP method and url suffix
        :return: answer as JSON
        """

        url = f"{self.BASE_URL}{payload['suffix']}/?key={self.api_key}"
        if query := payload.get('query'):
            url: str = f"{url}&{query}"
        try:
            print(f"Send \'{payload['method']}\' request to \'{url}\'")
            response = requests.request(method=payload['method'], url=url)
            status_code: int = response.status_code
            print(f'Response status code: {status_code}')
            if status_code == 401:
                raise ApiKeyException("Wrong Api key")
            return response.json()
        except requests.JSONDecodeError as err:
            raise DataException(f'JSON error: {err}')


def clean_article(article: str) -> str:
    """Return cleaned article string, contains only digits and letters"""

    return re.sub(r'[^a-zA-Z0-9]', '', article)


def show_result(data: Orders) -> None:
    """Print result"""

    for elem in data['resources']:
        prices: str = ''.join(
            (
                f'На складе осталось: {len(elem["offers"])}\n',
                '\n'.join(
                    f'Цена {elem["price"]}\n'
                    f'Средний срок доставки: {elem["average_period"]}'
                    for elem in elem["offers"]
                )
            ))
        print(
            f'\nАртикул: {elem["article"]}'
            f'\nБрэнд: {elem["brand"]["name"]}'
            f'\n{prices}'
        )


def main(api_key: str, items: list[Item]) -> None:
    """Create worker instance. Send results for show"""

    worker = Worker(api_key)
    result: Orders = worker.get_stock_with_filter_key(items=items, filter_key='resource_article')
    show_result(result)


if __name__ == '__main__':
    items: list[Item] = [
        {'resource_article': 'GDB1044'},
        {'resource_article': 'GDB1044'},
        {'resource_article': '1111'},
        {'resource_article': 'GDB1497'},
    ]
    try:
        if not API_KEY:
            raise ApiKeyException('API_KEY not found')
        main(api_key=API_KEY, items=items)
    except (
            ApiKeyException,
            DataException
    ) as err:
        exit(err)
