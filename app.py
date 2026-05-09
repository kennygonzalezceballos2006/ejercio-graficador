from flask import Flask, jsonify, request, render_template
import numpy as np
from modelos import enfriamiento, poblacion, mezclas

app = Flask(__name__)


@app.route('/')
def index():
    """Ruta principal que entrega el frontend de la aplicación."""
    return render_template('index.html')

@app.before_request
def log_request_info():
    print(f"Ruta: {request.path} | Metodo: {request.method}")

@app.route('/api/enfriamiento/', methods=['POST', 'OPTIONS'])
def resolver_enfriamiento():
    """Resuelve la Ley de Enfriamiento de Newton y devuelve la serie de datos."""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    datos = request.get_json(force=True)

    try:
        t_amb = float(datos.get('t_amb', 0))
        t0 = float(datos.get('t0', 0))
        k = float(datos.get('k', 0))
        t_max = float(datos.get('t_max', 0))

        if t_max <= 0 or k <= 0:
            raise ValueError('t_max y k deben ser valores positivos.')

        resultado = enfriamiento(t_amb, t0, k, t_max)
        return jsonify(resultado)

    except (TypeError, ValueError) as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/poblacion/', methods=['POST', 'OPTIONS'])
def resolver_poblacion():
    """Resuelve la EDO de crecimiento y decaimiento poblacional."""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    datos = request.get_json(force=True)

    try:
        p0 = float(datos.get('p0', 0))
        k = float(datos.get('k', 0))
        t_max = float(datos.get('t_max', 0))

        if t_max <= 0:
            raise ValueError('t_max debe ser un valor positivo.')
        if p0 <= 0:
            raise ValueError('La población inicial debe ser mayor que cero.')

        resultado = poblacion(p0, k, t_max)
        return jsonify(resultado)

    except (TypeError, ValueError) as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/mezclas/', methods=['POST', 'OPTIONS'])
def resolver_mezclas():
    """Resuelve el problema de mezclas y dilución en tanques."""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    datos = request.get_json(force=True)

    try:
        v = float(datos.get('v', 0))
        a0 = float(datos.get('a0', 0))
        r_in = float(datos.get('r_in', 0))
        r_out = float(datos.get('r_out', 0))
        t_max = float(datos.get('t_max', 0))

        if v <= 0 or t_max <= 0:
            raise ValueError('El volumen y t_max deben ser valores positivos.')
        if r_out < 0:
            raise ValueError('La tasa de salida no puede ser negativa.')

        resultado = mezclas(v, a0, r_in, r_out, t_max)
        return jsonify(resultado)

    except (TypeError, ValueError) as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
