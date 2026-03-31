#!/usr/bin/env bash
# Salir si hay un error
set -o errexit

# Instalar dependencias de Python
pip install -r requirements.txt

# Instalar Playwright y sus dependencias de sistema (ESTO ES LO IMPORTANTE)
playwright install chromium --with-deps