import os
import re

import requests
from dotenv import load_dotenv

from exceptions import ApiKeyException, DataException

load_dotenv()

API_KEY: str = os.getenv('API_KEY')


class Worker:
    BASE_URL = "https://api.berg.ru/v1.0"

    def __init__(self, api_key: str):
        self.api_key: str = api_key

    def get_stock_by_article(self, items: list, analogs: bool = False) -> dict[str, list[dict]]:
        """
        Return goods list by articles as JSON

        :param items: List of items contains article data
        :param analogs:
        :return: response from API as JSON
        """
        items_query: str = '&'.join(
            f'items[{index}][resource_article]={clean_article(elem["resource_article"])}'
            for index, elem in enumerate(items)
        )
        payload: dict = {
            "method": "GET",
            "url": f"/ordering/get_stock/?{items_query}",
        }
        if analogs:
            payload.update(url=f'{payload["url"]}&analogs=1')
        return self._send_request(payload)

    def _send_request(self, payload: dict) -> dict | list:
        """
        Add base url to head of payload url. Add api key to tail of payload url.
        Send request to url using payload method.

        :param payload: Dictionary with HTTP method and url suffix
        :return: answer as JSON
        """

        key: str = f'/?key={self.api_key}'
        if '?' in payload['url']:
            key: str = f'&key={self.api_key}'
        payload['url'] = f"{self.BASE_URL}{payload['url']}{key}"
        try:
            print(f"Send \'{payload['method']}\' request to \'{payload['url']}\'")
            response = requests.request(**payload)
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


def show_result(data: dict) -> None:
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
            f'\nАртикул: {elem["article"]}\n'
            f'Брэнд: {elem["brand"]["name"]}\n'
            f'{prices}'
        )


def main(items: list[dict]) -> None:
    """Create worker instance. Send results for show"""
    worker = Worker(API_KEY)
    result: dict = worker.get_stock_by_article(items=items)
    show_result(result)


if __name__ == '__main__':
    items: list[dict] = [
        {'resource_article': 'GDB1044'},
        {'resource_article': 'GDB1044'},
        {'resource_article': '1111'},
        {'resource_article': 'GDB1497'},
    ]
    try:
        if not API_KEY:
            raise ApiKeyException('API_KEY not found')
        main(items)
    except (
            ApiKeyException,
            DataException
    ) as err:
        exit(err)