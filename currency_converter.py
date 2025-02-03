#!/usr/bin/env python3

import sys
import json
import os
from datetime import datetime
from typing import Optional, Dict
import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
import requests
from decimal import Decimal

console = Console()

CURRENCY_CODES = {
    'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound', 'JPY': 'Japanese Yen',
    'AUD': 'Australian Dollar', 'CAD': 'Canadian Dollar', 'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan', 'NZD': 'New Zealand Dollar', 'SEK': 'Swedish Krona',
    'KRW': 'South Korean Won', 'SGD': 'Singapore Dollar', 'NOK': 'Norwegian Krone',
    'MXN': 'Mexican Peso', 'INR': 'Indian Rupee', 'RUB': 'Russian Ruble',
    'ZAR': 'South African Rand', 'TRY': 'Turkish Lira', 'BRL': 'Brazilian Real',
    'TWD': 'Taiwan Dollar', 'DKK': 'Danish Krone', 'PLN': 'Polish Zloty',
    'THB': 'Thai Baht', 'IDR': 'Indonesian Rupiah', 'HUF': 'Hungarian Forint',
    'CZK': 'Czech Koruna', 'ILS': 'Israeli Shekel', 'CLP': 'Chilean Peso',
    'PHP': 'Philippine Peso', 'AED': 'UAE Dirham', 'COP': 'Colombian Peso',
    'SAR': 'Saudi Riyal', 'MYR': 'Malaysian Ringgit', 'RON': 'Romanian Leu',
    'DOP': 'Dominican Peso', 'BGN': 'Bulgarian Lev', 'HKD': 'Hong Kong Dollar',
    'HRK': 'Croatian Kuna', 'PKR': 'Pakistani Rupee', 'EGP': 'Egyptian Pound',
    'ISK': 'Icelandic Króna', 'VND': 'Vietnamese Dong', 'NGN': 'Nigerian Naira'
}

API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest'

class CurrencyConverter:
    def __init__(self):
        self.history_file = "conversion_history.json"
        self.rates_cache_file = "rates_cache.json"

    def load_cached_rates(self) -> dict:
        """Load cached exchange rates from file."""
        try:
            with open(self.rates_cache_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def save_cached_rates(self, rates: dict):
        """Save exchange rates to cache file."""
        with open(self.rates_cache_file, 'w') as f:
            json.dump(rates, f)

    def save_to_history(self, amount: float, from_currency: str, to_currency: str, result: float):
        """Save conversion to history file."""
        try:
            with open(self.history_file, 'r') as f:
                history = json.load(f)
        except FileNotFoundError:
            history = []

        history.append({
            'timestamp': datetime.now().isoformat(),
            'from_amount': amount,
            'from_currency': from_currency,
            'to_currency': to_currency,
            'result': result
        })

        with open(self.history_file, 'w') as f:
            json.dump(history, f, indent=2)

    def show_history(self):
        """Display conversion history in a table."""
        try:
            with open(self.history_file, 'r') as f:
                history = json.load(f)
        except FileNotFoundError:
            console.print("[yellow]No conversion history found.[/yellow]")
            return

        table = Table(title="Conversion History")
        table.add_column("Date", style="cyan")
        table.add_column("From", style="green")
        table.add_column("To", style="green")
        table.add_column("Result", style="yellow")

        for entry in history:
            table.add_row(
                datetime.fromisoformat(entry['timestamp']).strftime('%Y-%m-%d %H:%M:%S'),
                f"{entry['from_amount']} {entry['from_currency']}",
                entry['to_currency'],
                f"{entry['result']:.2f}"
            )

        console.print(table)

    def list_currencies(self):
        """Display available currencies in a table."""
        table = Table(title="Available Currencies")
        table.add_column("Code", style="cyan")
        table.add_column("Currency Name", style="green")

        for code, name in sorted(CURRENCY_CODES.items()):
            table.add_row(code, name)

        console.print(table)

    def convert(self, amount: float, from_currency: str, to_currency: str, offline: bool = False) -> float:
        """Convert currency using real-time or cached rates."""
        try:
            if offline:
                rates = self.load_cached_rates()
                if not rates:
                    console.print("[red]No cached rates available. Please run in online mode first.[/red]")
                    sys.exit(1)
                rate = rates.get(f"{from_currency}_{to_currency}")
                if not rate:
                    console.print(f"[red]No cached rate found for {from_currency} to {to_currency}[/red]")
                    sys.exit(1)
                return amount * rate
            else:
                response = requests.get(f"{API_BASE_URL}/{from_currency}")
                if response.status_code != 200:
                    console.print("[red]Error: Unable to fetch exchange rates.[/red]")
                    sys.exit(1)

                data = response.json()
                if 'rates' not in data:
                    console.print("[red]Error: Invalid response from exchange rate API.[/red]")
                    sys.exit(1)

                rate = data['rates'].get(to_currency)
                if rate is None:
                    console.print(f"[red]Error: Rate not available for {from_currency} to {to_currency}[/red]")
                    sys.exit(1)

                # Cache the rate
                rates = self.load_cached_rates()
                rates[f"{from_currency}_{to_currency}"] = rate
                self.save_cached_rates(rates)

                return amount * rate
        except requests.exceptions.RequestException as e:
            console.print(f"[red]Error: Unable to connect to exchange rate service. {str(e)}[/red]")
            sys.exit(1)
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
            sys.exit(1)

def display_result(amount: float, from_currency: str, to_currency: str, result: float):
    """Display conversion result in a beautiful format."""
    table = Table(show_header=False, box=None)
    table.add_row(
        f"[green]{amount:,.2f}[/green]",
        f"[yellow]{from_currency}[/yellow]",
        "→",
        f"[green]{result:,.2f}[/green]",
        f"[yellow]{to_currency}[/yellow]"
    )
    
    panel = Panel(
        table,
        title="Currency Conversion Result",
        border_style="blue"
    )
    console.print(panel)

@click.group()
def cli():
    """Modern Currency Converter CLI Tool"""
    pass

@cli.command()
@click.option('--amount', type=float, required=True, help='Amount to convert')
@click.option('--from', 'from_currency', required=True, help='Source currency code')
@click.option('--to', 'to_currency', required=True, help='Target currency code')
@click.option('--save', is_flag=True, help='Save conversion to history')
@click.option('--offline', is_flag=True, help='Use cached exchange rates')
def convert(amount: float, from_currency: str, to_currency: str, save: bool, offline: bool):
    """Convert currency from one to another"""
    converter = CurrencyConverter()
    
    try:
        # Convert currencies to uppercase
        from_currency = from_currency.upper()
        to_currency = to_currency.upper()
        
        # Check if currencies are supported
        if from_currency not in CURRENCY_CODES:
            console.print(f"[red]Error: Currency {from_currency} is not supported[/red]")
            sys.exit(1)
        if to_currency not in CURRENCY_CODES:
            console.print(f"[red]Error: Currency {to_currency} is not supported[/red]")
            sys.exit(1)
        
        # Perform conversion
        result = converter.convert(amount, from_currency, to_currency, offline)
        
        # Display result
        display_result(amount, from_currency, to_currency, result)
        
        # Save to history if requested
        if save:
            converter.save_to_history(amount, from_currency, to_currency, result)
            console.print("[green]Conversion saved to history.[/green]")
            
    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        sys.exit(1)

@cli.command()
def list():
    """List all available currencies"""
    converter = CurrencyConverter()
    converter.list_currencies()

@cli.command()
def history():
    """Show conversion history"""
    converter = CurrencyConverter()
    converter.show_history()

if __name__ == '__main__':
    cli() 