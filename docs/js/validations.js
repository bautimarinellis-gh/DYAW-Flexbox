document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('.form');
    var greeting = document.querySelector('.form__greeting');
    var nombreInput = document.getElementById('nombre');

    // Función para actualizar el saludo
    function updateGreeting(value) {
        if (value.trim() === '') {
            greeting.textContent = 'HOLA';
        } else {
            greeting.textContent = 'HOLA ' + value.toUpperCase();
        }
    }

    // Validaciones
    // Evento keydown para actualizar en tiempo real
    nombreInput.addEventListener('keydown', function() {
        // Usamos setTimeout para asegurar que el valor se actualice
        setTimeout(function() {
            updateGreeting(nombreInput.value);
        }, 0);
    });

    // Evento focus para actualizar cuando se selecciona el campo
    nombreInput.addEventListener('focus', function() {
        updateGreeting(this.value);
    });

    // Evento blur para mantener el último valor
    nombreInput.addEventListener('blur', function() {
        updateGreeting(this.value);
    });

    var fields = {
        nombre: {
            validate: function(value) {
                var words = value.trim().split(/\s+/);
                return {
                    isValid: value.length > 6 && words.length >= 2,
                    message: 'El nombre debe tener más de 6 letras y al menos un espacio entre medio'
                };
            }
        },
        email: {
            validate: function(value) {
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    isValid: emailRegex.test(value),
                    message: 'Debe ingresar un email válido'
                };
            }
        },
        password: {
            validate: function(value) {
                var hasLetter = /[a-zA-Z]/.test(value);
                var hasNumber = /[0-9]/.test(value);
                return {
                    isValid: value.length >= 8 && hasLetter && hasNumber,
                    message: 'La contraseña debe tener al menos 8 caracteres, formados por letras y números'
                };
            }
        },
        password2: {
            validate: function(value) {
                var password = document.getElementById('password').value;
                return {
                    isValid: value === password,
                    message: 'Las contraseñas no coinciden'
                };
            }
        },
        edad: {
            validate: function(value) {
                var age = parseInt(value, 10);
                return {
                    isValid: !isNaN(age) && age >= 18,
                    message: 'Debe ser mayor o igual a 18 años'
                };
            }
        },
        telefono: {
            validate: function(value) {
                var cleanPhone = value.replace(/[\s\-\(\)]/g, '');
                return {
                    isValid: /^\d{7,}$/.test(cleanPhone),
                    message: 'El teléfono debe tener al menos 7 dígitos'
                };
            }
        },
        direccion: {
            validate: function(value) {
                var hasSpace = value.indexOf(' ') !== -1;
                var hasLetters = /[a-zA-Z]/.test(value);
                var hasNumbers = /[0-9]/.test(value);
                return {
                    isValid: value.length >= 5 && hasSpace && hasLetters && hasNumbers,
                    message: 'La dirección debe tener al menos 5 caracteres, con letras, números y un espacio'
                };
            }
        },
        ciudad: {
            validate: function(value) {
                return {
                    isValid: value.length >= 3,
                    message: 'La ciudad debe tener al menos 3 caracteres'
                };
            }
        },
        'codigo-postal': {
            validate: function(value) {
                return {
                    isValid: value.length >= 3,
                    message: 'El código postal debe tener al menos 3 caracteres'
                };
            }
        },
        dni: {
            validate: function(value) {
                return {
                    isValid: /^\d{7,8}$/.test(value),
                    message: 'El DNI debe tener 7 u 8 dígitos'
                };
            }
        }
    };

    // Función para mostrar mensaje de error
    function showError(input, message) {
        var formGroup = input.parentNode;
        var errorDiv = formGroup.querySelector('.form__error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form__error';
            formGroup.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        input.className += ' form__input--error';
    }

    // Función para limpiar mensaje de error
    function clearError(input) {
        var formGroup = input.parentNode;
        var errorDiv = formGroup.querySelector('.form__error');
        
        if (errorDiv) {
            formGroup.removeChild(errorDiv);
        }
        
        input.className = input.className.replace(' form__input--error', '');
    }

    // Agregar eventos blur y focus a cada campo
    for (var fieldName in fields) {
        if (fields.hasOwnProperty(fieldName)) {
            var input = document.getElementById(fieldName);
            if (input) {
                input.addEventListener('blur', function() {
                    var fieldName = this.id;
                    var validation = fields[fieldName].validate(this.value);
                    if (!validation.isValid) {
                        showError(this, validation.message);
                    } else {
                        clearError(this);
                    }
                });

                input.addEventListener('focus', function() {
                    clearError(this);
                });
            }
        }
    }

    // Manejar el envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var isValid = true;
        var errors = [];
        
        // Validar todos los campos
        for (var fieldName in fields) {
            if (fields.hasOwnProperty(fieldName)) {
                var input = document.getElementById(fieldName);
                if (input) {
                    var validation = fields[fieldName].validate(input.value);
                    if (!validation.isValid) {
                        isValid = false;
                        errors.push(input.previousElementSibling.textContent + ': ' + validation.message);
                        showError(input, validation.message);
                    }
                }
            }
        }

        // Mostrar mensaje emergente
        var message = '';
        if (isValid) {
            // Recolectar los datos del formulario
            var datos = {};
            for (var fieldName in fields) {
                if (fields.hasOwnProperty(fieldName)) {
                    var input = document.getElementById(fieldName);
                    if (input && fieldName !== 'password' && fieldName !== 'password2') {
                        datos[fieldName] = input.value;
                    }
                }
            }

            // Enviar los datos al servidor
            fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: { 'Content-type': 'application/json; charset=UTF-8' }
            })
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                mostrarModal('¡Envío exitoso!<br>Respuesta del servidor:<br><pre>' + JSON.stringify(data, null, 2) + '</pre>');
                localStorage.setItem('datosFormulario', JSON.stringify(datos));
            })
            .catch(error => {
                mostrarModal('Error al enviar los datos: ' + error.message);
            });
        } else {
            message = 'Por favor corrija los siguientes errores:<br><br>' + errors.join('<br>');
            mostrarModal(message);
        }
    });

    // Función para mostrar el modal
    function mostrarModal(mensaje) {
        var modalMensaje = document.getElementById('modal-mensaje');
        var modal = document.getElementById('modal');
        if (modalMensaje && modal) {
            modalMensaje.innerHTML = mensaje;
            modal.classList.remove('oculto');
        }
    }

    // Función para ocultar el modal
    var cerrarModal = document.getElementById('cerrar-modal');
    if (cerrarModal) {
        cerrarModal.onclick = function() {
            var modal = document.getElementById('modal');
            if (modal) {
                modal.classList.add('oculto');
            }
        };
    }

    // Al cargar la página, precargar datos si existen
    window.addEventListener('DOMContentLoaded', function() {
        var datosGuardados = localStorage.getItem('datosFormulario');
        if (datosGuardados) {
            var datos = JSON.parse(datosGuardados);
            for (var fieldName in datos) {
                if (datos.hasOwnProperty(fieldName)) {
                    var input = document.getElementById(fieldName);
                    if (input) {
                        input.value = datos[fieldName];
                    }
                }
            }
        }
    });
}); 