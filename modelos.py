import numpy as np


def enfriamiento(t_amb, t0, k, t_max, pasos=201):
    """Calcula la temperatura usando la Ley de Enfriamiento de Newton.

    T(t) = T_amb + (T0 - T_amb) * exp(-k t)
    """
    t = np.linspace(0, t_max, pasos)
    y = t_amb + (t0 - t_amb) * np.exp(-k * t)
    return {
        't': t.tolist(),
        'y': y.tolist(),
        'descripcion': 'Ley de enfriamiento de Newton: T(t) = T_amb + (T0 - T_amb) e^{-k t}'
    }


def poblacion(p0, k, t_max, pasos=201):
    """Calcula el crecimiento o decaimiento poblacional exponencial.

    P(t) = P0 * exp(k t)
    """
    t = np.linspace(0, t_max, pasos)
    y = p0 * np.exp(k * t)
    return {
        't': t.tolist(),
        'y': y.tolist(),
        'descripcion': 'Crecimiento/Decaimiento poblacional: P(t) = P0 e^{k t}'
    }


def mezclas(v, a0, r_in, r_out, t_max, pasos=201):
    """Calcula el contenido de soluto en un tanque con mezcla perfecta.

    Asumimos que la tasa de entrada y salida de volumen se estabiliza y que la
    concentración de entrada se modela como r_in. La ecuación es:
    dA/dt = r_out * r_in - (r_out / V) * A
    """
    t = np.linspace(0, t_max, pasos)
    if v <= 0:
        raise ValueError('El volumen debe ser mayor que cero.')

    k = r_out / v
    if r_out == 0:
        # Si no hay salida, la cantidad de soluto se mantiene constante
        y = np.full_like(t, a0)
    else:
        y = a0 * np.exp(-k * t) + v * r_in * (1 - np.exp(-k * t))

    return {
        't': t.tolist(),
        'y': y.tolist(),
        'descripcion': 'Mezclas y dilución en tanque: A(t) = A0 e^{-k t} + V c_{in} (1 - e^{-k t})'
    }
