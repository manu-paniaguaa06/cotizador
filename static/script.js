let agents = [
    { name: 'Agente Ventas', dev: 15000, mes: 2500, tin: '3M', tout: '1M', Callmins: '-', Capacity: '-' }
];

function addAgent() {
    agents.push({ name: 'Nuevo Agente', dev: 0, mes: 0, tin: '1M', tout: '1M', Callmins: '-', Capacity: '-' });
    renderInputs();
    update();
}

function updateAgent(i, key, val) {
    agents[i][key] = (key === 'dev' || key === 'mes') ? parseFloat(val) : val;
    update();
}

function renderInputs() {
    const container = document.getElementById('agents-input-container');
    container.innerHTML = '';
    agents.forEach((a, i) => {
        container.innerHTML += `
            <div class="agent-block">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <label style="margin:0; font-size:10px; color:#00d4ff;">AGENTE ${i + 1}</label>
                    <span class="btn-delete" onclick="deleteAgent(${i})">✕ Eliminar</span>
                </div>
                <input type="text" value="${a.name}" oninput="updateAgent(${i}, 'name', this.value)" placeholder="Nombre del Agente">
                <div style="display:flex; gap:5px">
                    <input type="number" value="${a.dev}" oninput="updateAgent(${i}, 'dev', this.value)" placeholder="Desarrollo">
                    <input type="number" value="${a.mes}" oninput="updateAgent(${i}, 'mes', this.value)" placeholder="Mensualidad">
                </div>
                <div style="display:flex; gap:5px">
                    <input type="text" value="${a.tin}" oninput="updateAgent(${i}, 'tin', this.value)" placeholder="Tokens In">
                    <input type="text" value="${a.tout}" oninput="updateAgent(${i}, 'tout', this.value)" placeholder="Tokens Out">
                    <input type="text" value="${a.Callmins}" oninput="updateAgent(${i}, 'Callmins', this.value)" placeholder="Call Mins">
                    <input type="text" value="${a.Capacity}" oninput="updateAgent(${i}, 'Capacity', this.value)" placeholder="Almacenamiento">
                </div>
            </div>`;
    });
}

function update() {
    document.getElementById('out_cliente').innerText = document.getElementById('in_cliente').value;
    document.getElementById('out_folio').innerText = document.getElementById('in_folio').value;
    document.getElementById('out_fecha').innerText = new Date().toLocaleDateString('es-MX');

    let subDev = 0, subMes = 0;
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    agents.forEach(a => {
        subDev += a.dev || 0;
        subMes += a.mes || 0;
        tbody.innerHTML += `
            <tr>
                <td>${a.name}</td>
                <td>$${(a.dev || 0).toLocaleString()}</td>
                <td>$${(a.mes || 0).toLocaleString()}</td>
                <td>${a.tin}</td>
                <td>${a.tout}</td>
                <td>${(a.Callmins || 0).toLocaleString()}</td>
                <td>${(a.Capacity || 0).toLocaleString()}</td>
            </tr>`;
    });

    const fijos = parseFloat(document.getElementById('in_fijos').value) || 0;
    subMes += fijos;
    tbody.innerHTML += `<tr><td>Costos Fijos Mensuales</td><td>-</td><td>$${fijos.toLocaleString()}</td><td>-</td><td>-</td></tr>`;

    const totalDev = subDev * 1.16;
    const totalMes = subMes * 1.16;

    document.getElementById('out_subtotal').innerText = `$${subDev.toLocaleString()} / $${subMes.toLocaleString()}`;
    document.getElementById('out_total').innerText = `$${totalDev.toLocaleString()}* / $${totalMes.toLocaleString()}`;
}

async function downloadPDF() {
    const element = document.getElementById('capture');
    
    // Clonamos para no modificar lo que el usuario ve
    const clone = element.cloneNode(true);
    
    // Capturamos todos los estilos actuales para que el PDF se vea igual
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                        .map(s => s.outerHTML).join('');
    
    const fullHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                ${styles}
                <style>
                    /* Forzamos el tamaño para evitar el espacio blanco */
                    html, body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 1000px !important; /* Ancho fijo igual al de la página */
                        overflow: hidden !important;
                        background: white !important;
                    }
                    .page { 
                        box-shadow: none !important; 
                        border-radius: 0 !important; 
                        margin: 0 !important; 
                        width: 1000px !important; 
                        min-height: auto !important;
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                    }
                    /* Si tienes blobs con posiciones negativas o muy a la derecha, 
                    esto evita que ensanchen la hoja */
                    * { max-width: 1000px !important; } 
                    .blob { pointer-events: none; }
                </style>
            </head>
            <body>
                ${clone.outerHTML}
            </body>
        </html>`;

    const response = await fetch('/exportar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml })
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cotizacion_Vimaa_${document.getElementById('in_cliente').value}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else {
        alert("Error al generar el PDF.");
    }
}


function deleteAgent(index) {
    // Solo permitimos eliminar si hay más de un agente (opcional)
    if (agents.length > 1) {
        agents.splice(index, 1); // Quita el agente en esa posición
        renderInputs();          // Vuelve a dibujar los inputs
        update();                // Actualiza la vista previa del PDF
    } else {
        alert("Debes tener al menos un agente en la cotización.");
    }
}

renderInputs();
update();