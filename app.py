from flask import Flask, render_template, request, send_file
from playwright.sync_api import sync_playwright
import io

app = Flask(__name__)

def html_to_pdf(html_content):
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process' # Reduce el uso de RAM considerablemente
            ]
        )
        # 1. Definimos un viewport inicial que coincida con tu diseño (1000px)
        context = browser.new_context(viewport={'width': 1000, 'height': 800})
        page = context.new_page()
        
        page.set_content(html_content)
        page.wait_for_timeout(1000)
        
        # 2. Medimos el contenido real
        height = page.evaluate("() => document.documentElement.scrollHeight")
        
        # 3. Generamos el PDF forzando el ancho a 1000px (sin dejar aire a la derecha)
        pdf_bytes = page.pdf(
            width="1000px",
            height=f"{height}px",
            print_background=True,
            margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"}
        )
        
        browser.close()
        return pdf_bytes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/exportar-pdf', methods=['POST'])
def exportar_pdf():
    try:
        data = request.get_json()
        html_data = data.get('html')
        
        if not html_data:
            return "No se recibió contenido HTML", 400

        # Llamamos a la función de conversión
        pdf_bytes = html_to_pdf(html_data)
        
        # Enviamos el archivo de vuelta al navegador
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name='Cotizacion_Vimaa.pdf'
        )
    except Exception as e:
        print(f"Error generado: {e}")
        return f"Error en el servidor: {str(e)}", 500

if __name__ == '__main__':
    import os
    # Railway inyecta automáticamente la variable PORT
    port = int(os.environ.get("PORT", 8080))
    # DEBE SER 0.0.0.0 para que Railway pueda conectar con el contenedor
    app.run(host="0.0.0.0", port=port)