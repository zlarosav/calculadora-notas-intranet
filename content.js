// CALCULADORA DE NOTAS UNJFSC - Content Script
(function() {
    'use strict';

    // Verificar que estamos en la página correcta y que existe la tabla de notas
    function verificarPaginaValida() {
        const panel = document.querySelector('#ctl00_cphAreaContenido_Panel1');
        const tabla = document.querySelector('#ctl00_cphAreaContenido_gvNotasCompetencias');
        return panel && tabla;
    }

    // Esperar a que la página cargue completamente
    function inicializar() {
        if (!verificarPaginaValida()) {
            console.log('⚠️ Calculadora de Notas: Página no válida o tabla no encontrada');
            return;
        }

        // Verificar si ya se inyectó el script
        if (document.getElementById('inputPromedioDeseado')) {
            console.log('ℹ️ Calculadora de Notas: Ya está cargada');
            return;
        }

        inyectarCalculadora();
    }

    function inyectarCalculadora() {
        // Funciones principales
        function calcularNotasNecesarias(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            const promedioDeseado = parseFloat(document.getElementById('inputPromedioDeseado').value);
            const resultado = document.getElementById('resultadoCalculadora');

            if (isNaN(promedioDeseado) || promedioDeseado < 0 || promedioDeseado > 20) {
                resultado.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#c0392b;padding:10px;"><strong>⚠️ Por favor, ingresa un promedio válido entre 0 y 20.</strong></td></tr>';
                return false;
            }

            const cursos = [];
            const filasTabla = document.querySelectorAll('#ctl00_cphAreaContenido_gvNotasCompetencias tr');
            
            filasTabla.forEach((fila, index) => {
                if (index < 2) return;
                const nombreCurso = fila.querySelector('[id*="lblCursoCompet"]');
                if (!nombreCurso || nombreCurso.textContent.trim() === '') return;

                const pm1Elem = fila.querySelector('[id*="lblPM1"]');
                const pm2Elem = fila.querySelector('[id*="lblPM2"]');
                const pm3Elem = fila.querySelector('[id*="lblPM3"]');
                const pm4Elem = fila.querySelector('[id*="lblPM4"]');
                const pfElem = fila.querySelector('[id*="lblPMF"]');

                // Obtener valores originales para PM
                const pm1Original = pm1Elem?.getAttribute('data-original')?.trim();
                const pm2Original = pm2Elem?.getAttribute('data-original')?.trim();
                const pm3Original = pm3Elem?.getAttribute('data-original')?.trim();
                const pm4Original = pm4Elem?.getAttribute('data-original')?.trim();

                cursos.push({
                    nombre: nombreCurso.textContent.trim(),
                    pm1: pm1Original && pm1Original !== '--' && pm1Original !== '' ? parseFloat(pm1Original) : null,
                    pm2: pm2Original && pm2Original !== '--' && pm2Original !== '' ? parseFloat(pm2Original) : null,
                    pm3: pm3Original && pm3Original !== '--' && pm3Original !== '' ? parseFloat(pm3Original) : null,
                    pm4: pm4Original && pm4Original !== '--' && pm4Original !== '' ? parseFloat(pm4Original) : null,
                    pm1Elem, pm2Elem, pm3Elem, pm4Elem, pfElem
                });
            });

            if (cursos.length === 0) {
                resultado.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#c0392b;padding:10px;"><strong>⚠️ No se encontraron cursos.</strong></td></tr>';
                return false;
            }

            let html = '';
            cursos.forEach(curso => {
                // Filtrar solo los valores reales (los valores originales)
                const valoresReales = [];
                if (curso.pm1 !== null) valoresReales.push(curso.pm1);
                if (curso.pm2 !== null) valoresReales.push(curso.pm2);
                if (curso.pm3 !== null) valoresReales.push(curso.pm3);
                if (curso.pm4 !== null) valoresReales.push(curso.pm4);
                
                const puntosActuales = valoresReales;
                const pmFaltantes = 4 - puntosActuales.length;
                
                if (pmFaltantes === 0) {
                    const promedioActual = puntosActuales.reduce((a, b) => a + b, 0) / 4;
                    html += `<tr><td style="padding:6px;">${curso.nombre}</td><td style="padding:6px;color:#27ae60;"><strong>✅ Curso completado - PF: ${promedioActual.toFixed(1)}</strong></td></tr>`;
                } else {
                    const sumaActual = puntosActuales.reduce((a, b) => a + b, 0);
                    const puntajeTotal = promedioDeseado * 4;
                    const puntajeFaltante = puntajeTotal - sumaActual;
                    const notaNecesaria = Math.max(0, puntajeFaltante / pmFaltantes);

                    if (notaNecesaria > 20) {
                        html += `<tr><td style="padding:6px;">${curso.nombre}</td><td style="padding:6px;color:#e74c3c;"><strong>⚠️ Imposible alcanzar el promedio (necesitas ${notaNecesaria.toFixed(1)} por PM)</strong></td></tr>`;
                    } else if (puntajeFaltante <= 0) {
                        // El promedio deseado ya está alcanzado o superado
                        const puntosExtra = Math.abs(puntajeFaltante);
                        html += `<tr><td style="padding:6px;">${curso.nombre}</td><td style="padding:6px;color:#27ae60;"><strong>✅ Promedio final deseado alcanzado con ${puntosExtra.toFixed(1)} puntos de sobra</strong></td></tr>`;
                        
                        // Rellenar PM vacíos con 0 o nota mínima para mantener el promedio
                        const notaMinima = 0;
                        
                        // Rellenar PM1
                        if (curso.pm1 === null && curso.pm1Elem) {
                            curso.pm1Elem.textContent = notaMinima.toFixed(1);
                            curso.pm1Elem.style.color = '#27ae60';
                            curso.pm1Elem.style.fontWeight = 'bold';
                            curso.pm1Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Rellenar PM2
                        if (curso.pm2 === null && curso.pm2Elem) {
                            curso.pm2Elem.textContent = notaMinima.toFixed(1);
                            curso.pm2Elem.style.color = '#27ae60';
                            curso.pm2Elem.style.fontWeight = 'bold';
                            curso.pm2Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Rellenar PM3
                        if (curso.pm3 === null && curso.pm3Elem) {
                            curso.pm3Elem.textContent = notaMinima.toFixed(1);
                            curso.pm3Elem.style.color = '#27ae60';
                            curso.pm3Elem.style.fontWeight = 'bold';
                            curso.pm3Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Rellenar PM4
                        if (curso.pm4 === null && curso.pm4Elem) {
                            curso.pm4Elem.textContent = notaMinima.toFixed(1);
                            curso.pm4Elem.style.color = '#27ae60';
                            curso.pm4Elem.style.fontWeight = 'bold';
                            curso.pm4Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Calcular y mostrar PF actual
                        const promedioActual = sumaActual / 4;
                        if (curso.pfElem) {
                            curso.pfElem.textContent = promedioActual.toFixed(1);
                            curso.pfElem.style.color = '#27ae60';
                            curso.pfElem.style.fontWeight = 'bold';
                            curso.pfElem.setAttribute('data-modified-by-extension', 'true');
                        }
                    } else {
                        // Mostrar puntos totales faltantes en lugar de nota por PM
                        html += `<tr><td style="padding:6px;">${curso.nombre}</td><td style="padding:6px;"><strong style="color:#2980b9;">🎯 Necesitas ${puntajeFaltante.toFixed(1)}</strong> puntos en total para alcanzar PF ${promedioDeseado.toFixed(1)}</td></tr>`;

                        // Rellenar PM1
                        if (curso.pm1 === null && curso.pm1Elem) {
                            curso.pm1Elem.textContent = notaNecesaria.toFixed(1);
                            curso.pm1Elem.style.color = '#2980b9';
                            curso.pm1Elem.style.fontWeight = 'bold';
                            curso.pm1Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Rellenar PM2
                        if (curso.pm2 === null && curso.pm2Elem) {
                            curso.pm2Elem.textContent = notaNecesaria.toFixed(1);
                            curso.pm2Elem.style.color = '#2980b9';
                            curso.pm2Elem.style.fontWeight = 'bold';
                            curso.pm2Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Rellenar PM3
                        if (curso.pm3 === null && curso.pm3Elem) {
                            curso.pm3Elem.textContent = notaNecesaria.toFixed(1);
                            curso.pm3Elem.style.color = '#2980b9';
                            curso.pm3Elem.style.fontWeight = 'bold';
                            curso.pm3Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Rellenar PM4
                        if (curso.pm4 === null && curso.pm4Elem) {
                            curso.pm4Elem.textContent = notaNecesaria.toFixed(1);
                            curso.pm4Elem.style.color = '#2980b9';
                            curso.pm4Elem.style.fontWeight = 'bold';
                            curso.pm4Elem.setAttribute('data-modified-by-extension', 'true');
                        }
                        
                        // Rellenar PF
                        if (curso.pfElem) {
                            curso.pfElem.textContent = promedioDeseado.toFixed(1);
                            curso.pfElem.style.color = '#2980b9';
                            curso.pfElem.style.fontWeight = 'bold';
                            curso.pfElem.setAttribute('data-modified-by-extension', 'true');
                        }
                    }
                }
            });
            resultado.innerHTML = html;
            return false;
        }

        function limpiarCalculadora(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            document.getElementById('inputPromedioDeseado').value = '10.5';
            document.getElementById('resultadoCalculadora').innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;padding:10px;font-style:italic;">Ingresa un promedio y presiona Calcular...</td></tr>';
            
            // Limpiar las celdas que fueron modificadas por la extensión
            const filas = document.querySelectorAll('#ctl00_cphAreaContenido_gvNotasCompetencias tr');
            filas.forEach((fila, index) => {
                if (index < 2) return;
                
                // Limpiar PM y PF
                ['PM1', 'PM2', 'PM3', 'PM4', 'PMF'].forEach(pm => {
                    const elem = fila.querySelector(`[id*="lbl${pm}"]`);
                    if (elem && elem.getAttribute('data-modified-by-extension') === 'true') {
                        const orig = elem.getAttribute('data-original');
                        if (orig !== null) elem.textContent = orig;
                        elem.style.color = '';
                        elem.style.fontWeight = '';
                        elem.removeAttribute('data-modified-by-extension');
                    }
                });
            });
            return false;
        }

        // Guardar valores originales
        const filas = document.querySelectorAll('#ctl00_cphAreaContenido_gvNotasCompetencias tr');
        filas.forEach((fila, index) => {
            if (index < 2) return;
            
            // Guardar valores originales de PM y PF
            ['PM1', 'PM2', 'PM3', 'PM4', 'PMF'].forEach(pm => {
                const elem = fila.querySelector(`[id*="lbl${pm}"]`);
                if (elem) elem.setAttribute('data-original', elem.textContent);
            });
        });

        // Crear la interfaz
        const panel = document.querySelector('#ctl00_cphAreaContenido_Panel1');
        if (panel) {
            const calculadora = document.createElement('div');
            calculadora.innerHTML = `
<br>
<table cellpadding="0" cellspacing="0" width="100%">
    <caption class="TituloSeccionData">CALCULADORA DE NOTAS NECESARIAS</caption>
    <tbody>
        <tr><td>
            <table class="mGrid" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                <tbody>
                    <tr>
                        <th colspan="2" style="background-color:#3B5998;color:white;padding:6px;text-align:left;font-size:11px;">
                            📊 Calcula las notas necesarias para alcanzar tu promedio deseado
                        </th>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding:10px;background-color:#f5f5f5;">
                            <form id="formCalculadora" style="margin:0;">
                                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                    <span style="font-weight:bold;color:#333;font-size:11px;white-space:nowrap;">
                                        Promedio Final Deseado (PF):
                                    </span>
                                    <input type="number" id="inputPromedioDeseado" min="0" max="20" step="0.1" value="10.5" style="padding:4px 6px;border:1px solid #ccc;font-size:11px;width:80px;">
                                    <button type="button" id="btnCalcular" style="padding:4px 12px;background-color:#3B5998;color:white;border:1px solid #2d4373;cursor:pointer;font-size:11px;margin-left:5px;" onmouseover="this.style.backgroundColor='#2d4373'" onmouseout="this.style.backgroundColor='#3B5998'">🔍 Calcular</button>
                                    <button type="button" id="btnLimpiar" style="padding:4px 12px;background-color:#95a5a6;color:white;border:1px solid #7f8c8d;cursor:pointer;font-size:11px;" onmouseover="this.style.backgroundColor='#7f8c8d'" onmouseout="this.style.backgroundColor='#95a5a6'">🔄 Limpiar</button>
                                </div>
                                <div style="margin-top:8px;padding:6px;background-color:#d9edf7;border:1px solid #bce8f1;color:#31708f;font-size:10px;">
                                    <strong>ℹ️ Información:</strong> Este cálculo divide equitativamente el puntaje faltante entre todos los PM vacíos. Las notas calculadas aparecerán en <strong style="color:#2980b9;">azul</strong> en la tabla principal.
                                </div>
                            </form>
                        </td>
                    </tr>
                    <tr>
                        <th colspan="2" style="background-color:#555;color:white;padding:5px;text-align:left;font-size:11px;">📋 Resultados</th>
                    </tr>
                    <tbody id="resultadoCalculadora">
                        <tr><td colspan="2" style="text-align:center;color:#999;padding:10px;font-style:italic;">Ingresa un promedio y presiona Calcular...</td></tr>
                    </tbody>
                </tbody>
            </table>
        </td></tr>
    </tbody>
</table>`;
            panel.appendChild(calculadora);
            
            // Agregar event listeners después de insertar el HTML
            const btnCalcular = document.getElementById('btnCalcular');
            const btnLimpiar = document.getElementById('btnLimpiar');
            const inputPromedio = document.getElementById('inputPromedioDeseado');
            const formCalculadora = document.getElementById('formCalculadora');
            
            if (btnCalcular) {
                btnCalcular.addEventListener('click', calcularNotasNecesarias);
            }
            
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', limpiarCalculadora);
            }
            
            if (inputPromedio) {
                inputPromedio.addEventListener('keypress', function(event) {
                    if (event.keyCode === 13 || event.key === 'Enter') {
                        event.preventDefault();
                        calcularNotasNecesarias(event);
                    }
                });
            }
            
            if (formCalculadora) {
                formCalculadora.addEventListener('submit', function(event) {
                    event.preventDefault();
                    calcularNotasNecesarias(event);
                });
            }
            
            console.log('%c✅ Calculadora de Notas UNJFSC cargada exitosamente', 'color: #27ae60; font-weight: bold; font-size: 14px;');
            
            // Calcular automáticamente con el valor por defecto
            setTimeout(() => {
                calcularNotasNecesarias();
            }, 100);
        } else {
            console.error('❌ No se encontró el panel de notas');
        }
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }
})();
