# Importación de módulos necesarios
from flask import Flask, jsonify, request,redirect, url_for, session, render_template
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, ValidationError
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from sqlalchemy import func
from flask_bcrypt import Bcrypt
import datetime
from functools import wraps

# Creación de la aplicación Flask
app = Flask(__name__)
CORS(app)  # Permite el acceso desde el frontend al backend

# Establecer la clave secreta de la aplicación
app.config['SECRET_KEY'] = 'keypetcare'  # Reemplaza con una clave segura y secreta


# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/pet_care'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)

# decorador que verifica si el usuario está autenticado
def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return func(*args, **kwargs)
    return decorated_function

@app.route('/bienvenida.html')
@login_required
def bienvenida():
    return render_template('index.html')

@app.route('/productos.html')
@login_required
def productos():
    return render_template('productos.html')

@app.route('/turnos.html')
@login_required
def turnos():
    return render_template('turnos.html')

@app.route('/turno_update.html')
@login_required
def turno_update():
    return render_template('turno_update.html')

@app.route('/productos_update.html')
@login_required
def productos_update():
    return render_template('productos_update.html')

# Definición del modelo de datos
class Rol(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)

# Definición del modelo de datos
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('rol.id'), nullable=False)
    rol = db.relationship('Rol', backref='usuarios')

# Agregamos un método para establecer la contraseña con bcrypt
def set_password(self, password):
    self.password = bcrypt.generate_password_hash(password).decode('utf-8')

Usuario.set_password = set_password

# Definición del esquema
class UsuarioSchema(ma.Schema):
    class Meta:
        fields = ('id', 'user', 'password', 'rol_id')

usuario_schema = UsuarioSchema()
usuarios_schema = UsuarioSchema(many=True)

# Insertar usuarios de prueba
with app.app_context():
    # Eliminar usuario existente con el nombre 'admin'
    existing_admin = Usuario.query.filter_by(user='admin').first()
    if existing_admin:
        db.session.delete(existing_admin)
        db.session.commit()

    # Insertar el nuevo usuario 'admin'
    admin_user = Usuario(user='admin', rol_id=1)
    admin_user.set_password('petcareadmin1')
    db.session.add(admin_user)
    db.session.commit()

    # Eliminar usuario existente con el nombre 'Murdoy'
    existing_user = Usuario.query.filter_by(user='Murdoy').first()
    if existing_user:
        db.session.delete(existing_user)
        db.session.commit()

    # Insertar el nuevo usuario 'Murdoy'
    new_user = Usuario(user='Murdoy', rol_id=2)
    new_user.set_password('petcare123')
    db.session.add(new_user)
    db.session.commit()

# Endpoint GET para obtener todos los usuarios
@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = Usuario.query.all()
    resultado = usuarios_schema.dump(usuarios)
    return jsonify(resultado)

# Endpoint POST para iniciar sesión
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = data.get('user')
        password = data.get('password')

        usuario = Usuario.query.filter_by(user=user).first()

        if usuario:
            print('Stored Password:', usuario.password)
            if bcrypt.check_password_hash(usuario.password, password):
                # Guardar información de sesión
                session['user'] = usuario.user
                session['rol_id'] = usuario.rol_id  # Agregar rol_id a la sesión
                return jsonify({'mensaje': 'Inicio de sesión exitoso', 'rol_id': usuario.rol_id})
            else:
                return jsonify({'error': 'Contraseña incorrecta'}), 401
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 401

    except Exception as e:
        return jsonify({'error': f'Error en el servidor: {str(e)}'}), 500


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
        order_by = request.args.get('order_by', default='id', type=str)
        order_dir = request.args.get('order_dir', default='asc', type=str)

        # Ajustamos la consulta para incluir la ordenación
        order_column = getattr(Producto, order_by)
        productos_query = Producto.query.order_by(order_column.asc() if order_dir == 'asc' else order_column.desc())
        productos_query = productos_query.paginate(page=page, per_page=per_page, error_out=False)

        total_items = productos_query.total

        if productos_query.items:
            # Convertir la lista de productos a un formato JSON y devolverlo como respuesta
            return jsonify({
                'total_items': total_items,
                'productos': productos_schema.dump(productos_query.items),
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

