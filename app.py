# Importación de módulos necesarios
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, ValidationError
from flask_cors import CORS
from flask_marshmallow import Marshmallow
import datetime

# Creación de la aplicación Flask
app = Flask(__name__)
CORS(app)  # Permite el acceso desde el frontend al backend

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/pet_care'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

# Definición del modelo de datos
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre_producto = db.Column(db.String(50))
    descripcion_producto = db.Column(db.String(250))
    categoria = db.Column(db.String(50))
    proveedor = db.Column(db.String(50))
    cantidad = db.Column(db.Integer)
    precio_unitario = db.Column(db.DECIMAL(11, 2))
    
    def __init__(self, nombre_producto, descripcion_producto, categoria, proveedor, cantidad, precio_unitario):
        self.nombre_producto = nombre_producto
        self.descripcion_producto = descripcion_producto
        self.categoria = categoria
        self.proveedor = proveedor
        self.cantidad = cantidad
        self.precio_unitario = precio_unitario

# Definición del esquema
class ProductoSchema(ma.Schema):
    class Meta:
        fields = ('id', 'nombre_producto', 'descripcion_producto', 'categoria', 'proveedor', 'cantidad', 'precio_unitario')

# Creación de esquemas para la base de datos
producto_schema = ProductoSchema()
productos_schema = ProductoSchema(many=True)

# Creación de la tabla
with app.app_context():
    db.create_all()

# Endpoint Get
@app.route('/productos', methods=['GET'])
def get_all_productos():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        productos = Producto.query.paginate(page=page, per_page=per_page, error_out=False)
        total_items = productos.total

        if productos.items:
            # Convertir la lista de productos a un formato JSON y devolverlo como respuesta
            return jsonify({
                'total_items': total_items,
                'productos': productos_schema.dump(productos.items),
            })
        else:
            return jsonify({
                'total_items': 0,
                'productos': [],
            })

    except Exception as e:
        print(e)  # Imprime el error en la consola
        return jsonify({'error': str(e)}), 500

# Endpoint GET por ID para obtener un producto específico
@app.route('/productos/<id>', methods=['GET'])
def get_producto(id):
    try:
        producto = Producto.query.get(id)

        if producto:
            return producto_schema.jsonify(producto)
        else:
            return jsonify({'error': 'Producto no encontrado'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para crear un nuevo producto mediante una solicitud POST
@app.route('/productos', methods=['POST'])
def create_producto():
    try:
        json_data = request.get_json()
        nombre_producto = json_data['nombre_producto']
        descripcion_producto = json_data['descripcion_producto']
        categoria = json_data['categoria']
        proveedor = json_data['proveedor']
        cantidad = json_data['cantidad']
        precio_unitario = json_data['precio_unitario']

        # Cargar datos JSON en un objeto Producto
        nuevo_producto = Producto(nombre_producto, descripcion_producto, categoria, proveedor, cantidad, precio_unitario)

        db.session.add(nuevo_producto)
        db.session.commit()

        return producto_schema.jsonify(nuevo_producto), 201
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400

# Ruta para actualizar un producto mediante una solicitud PUT
@app.route('/productos/<id>', methods=['PUT'])
def update_producto(id):
    try:
        producto = Producto.query.get(id)

        # Verificar si el producto existe en la base de datos
        if producto:
            json_data = request.get_json()
            producto.nombre_producto = json_data.get('nombre_producto', producto.nombre_producto)
            producto.descripcion_producto = json_data.get('descripcion_producto', producto.descripcion_producto)
            producto.categoria = json_data.get('categoria', producto.categoria)
            producto.proveedor = json_data.get('proveedor', producto.proveedor)
            producto.cantidad = json_data.get('cantidad', producto.cantidad)
            producto.precio_unitario = json_data.get('precio_unitario', producto.precio_unitario)

            # Realizar validaciones según tus requerimientos

            db.session.commit()
            return producto_schema.jsonify(producto)
        else:
            return jsonify({'error': 'Producto no encontrado'}), 404  # Devolver código 404 si el producto no existe

    except ValidationError as err:
        return jsonify({'error': err.messages}), 400  # Devolver mensajes de error de validación con el código 400 (error de solicitud)

# Ruta para eliminar un producto mediante una solicitud DELETE
@app.route('/productos/<id>', methods=['DELETE'])
def delete_producto(id):
    try:
        producto = Producto.query.get(id)

        # Verificar si el producto existe en la base de datos
        if producto:
            db.session.delete(producto)
            db.session.commit()
            return producto_schema.jsonify(producto)
        else:
            return jsonify({'error': 'Producto no encontrado'}), 404  # Devolver código 404 si el producto no existe

    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Devolver código 500 si hay un error durante la eliminación

        # Definición del modelo de datos
class Turno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, unique=True, nullable=False)
    hora = db.Column(db.Time, unique=True, nullable=False)
    paciente_nombre = db.Column(db.String(255), nullable=False)
    especialidad = db.Column(db.String(100))
    estado = db.Column(db.Enum('Programado', 'En curso', 'Completado', 'Cancelado'), default='Programado')
    notas = db.Column(db.Text)
    created_at = db.Column(db.TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __init__(self, fecha, hora, paciente_nombre, especialidad, estado, notas):
        self.fecha = fecha
        self.hora = hora
        self.paciente_nombre = paciente_nombre
        self.especialidad = especialidad
        self.estado = estado
        self.notas = notas

# Definición del esquema
class TurnoSchema(ma.Schema):
    class Meta:
        fields = ('id', 'fecha', 'hora', 'paciente_nombre', 'especialidad', 'estado', 'notas')

# Creación de esquemas para la base de datos
turno_schema = TurnoSchema()
turnos_schema = TurnoSchema(many=True)

# Creación de la tabla
with app.app_context():
    db.create_all()

# Endpoint Get
@app.route('/turnos', methods=['GET'])
def get_all_turnos():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        turnos_pagination = Turno.query.paginate(page=page, per_page=per_page)
        total_items = turnos_pagination.total

        turnos = turnos_pagination.items

        if turnos:
            # Convertir la lista de turnos a un formato JSON y devolverlo como respuesta
            return jsonify({
                'totalItems': total_items,
                'turnos': turnos_schema.dump(turnos)
            })
        else:
            return jsonify({
                'totalItems': 0,
                'turnos': []
            })  # Si no hay turnos, devolver una lista vacía

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint GET por ID para obtener un turno específico
@app.route('/turnos/<id>', methods=['GET'])
def get_turno(id):
    try:
        turno = Turno.query.get(id)

        if turno:
            return turno_schema.jsonify(turno)
        else:
            return jsonify({'error': 'Turno no encontrado'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Nueva función para validar el horario de los turnos
def validar_horario(fecha, hora):
    # Obtén el día de la semana (lunes: 0, martes: 1, ..., domingo: 6)
    dia_semana = fecha.weekday()

    # Verifica el horario según las restricciones
    if 9 <= hora.hour < 21 and 0 <= dia_semana < 5:  # De lunes a viernes de 9 a 21
        return True
    elif (9 <= hora.hour < 13 or 17 <= hora.hour < 21) and dia_semana == 5:  # Sábado de 9 a 13 y 17 a 21
        return True
    else:
        return False

# Nueva función para verificar si un turno está ocupado
def turno_ocupado(fecha, hora):
    # Consulta la base de datos para verificar si ya existe un turno en esa fecha y hora
    turno_existente = Turno.query.filter_by(fecha=fecha, hora=hora).first()
    return turno_existente is not None

# Ruta para crear un nuevo turno mediante una solicitud POST
@app.route('/turnos', methods=['POST'])
def create_turno():
    try:
        json_data = request.get_json()
        fecha = datetime.datetime.strptime(json_data['fecha'], '%Y-%m-%d').date()
        hora = datetime.datetime.strptime(json_data['hora'], '%H:%M').time()
        paciente_nombre = json_data['paciente_nombre']
        especialidad = json_data['especialidad']
        estado = json_data['estado']
        notas = json_data['notas']

    
        nuevo_turno = Turno(
            fecha=fecha,
            hora=hora,
            paciente_nombre=paciente_nombre,
            especialidad=especialidad,
            estado=estado,
            notas=notas
        )

        db.session.add(nuevo_turno)
        db.session.commit()

        return turno_schema.jsonify(nuevo_turno), 201
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400

# Ruta para actualizar un turno mediante una solicitud PUT
@app.route('/turnos/<id>', methods=['PUT'])
def update_turno(id):
    try:
        turno = Turno.query.get(id)

        # Verificar si el turno existe en la base de datos
        if turno:
            json_data = request.get_json()
            turno.fecha = datetime.datetime.strptime(json_data.get('fecha', str(turno.fecha)), '%Y-%m-%d').date()
            
            # Modifica la línea para manejar la cadena de tiempo directamente
            turno.hora = json_data.get('hora', str(turno.hora))

            turno.paciente_nombre = json_data.get('paciente_nombre', turno.paciente_nombre)
            turno.especialidad = json_data.get('especialidad', turno.especialidad)
            turno.estado = json_data.get('estado', turno.estado)
            turno.notas = json_data.get('notas', turno.notas)

            # Realizar validaciones según tus requerimientos

            db.session.commit()
            return turno_schema.jsonify(turno)
        else:
            return jsonify({'error': 'Turno no encontrado'}), 404  # Devolver código 404 si el turno no existe

    except ValidationError as err:
        return jsonify({'error': err.messages}), 400  # Devolver mensajes de error de validación con el código 400 (error de solicitud)

# Ruta para eliminar un turno mediante una solicitud DELETE
@app.route('/turnos/<id>', methods=['DELETE'])
def delete_turno(id):
    try:
        turno = Turno.query.get(id)

        # Verificar si el turno existe en la base de datos
        if turno:
            db.session.delete(turno)
            db.session.commit()
            return turno_schema.jsonify(turno)
        else:
            return jsonify({'error': 'Turno no encontrado'}), 404  # Devolver código 404 si el turno no existe

    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Devolver código 500 si hay un error durante la eliminación

if __name__ == '__main__':
    app.run(debug=True)

