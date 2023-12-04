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

#Endpoint Get
@app.route('/productos', methods=['GET'])
def get_all_productos():
    try:
        productos = Producto.query.all()
        if productos:
            # Convertir la lista de productos a un formato JSON y devolverlo como respuesta
            return jsonify(productos_schema.dump(productos))
        else:
            return jsonify([])  # Si no hay productos, devolver una lista vacía

    except Exception as e:
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

if __name__ == '__main__':
    app.run(debug=True)

