# Usamos la imagen oficial de Playwright que ya trae TODO instalado
FROM mcr.microsoft.com/playwright/python:v1.49.0-jammy

# Directorio de trabajo
WORKDIR /app

# Copiamos los requisitos e instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . .

# Railway usa el puerto 8080 por defecto
ENV PORT=8080
EXPOSE 8080

# Comando para arrancar la app
CMD ["python", "app.py"]