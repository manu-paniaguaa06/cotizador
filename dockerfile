# Esta imagen de Microsoft ya trae TODAS las librerías que te faltan
FROM mcr.microsoft.com/playwright/python:v1.49.0-jammy

WORKDIR /app

# Instalamos las librerías de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalamos el navegador (las dependencias de sistema ya vienen en la imagen base)
RUN playwright install chromium

# Copiamos el resto de tus archivos
COPY . .

# Railway usa el puerto 8080
ENV PORT=8080
EXPOSE 8080

# Comando para arrancar
CMD ["python", "app.py"]