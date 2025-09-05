-- Función para registrar movimientos automáticamente al crear insumos
CREATE OR REPLACE FUNCTION registrar_alta_insumo()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        movimiento_id INT;
    BEGIN
        -- Insertar movimiento de inventario
        INSERT INTO movimiento_inventario (
            id_tipo_movimiento,
            id_usuario,
            observaciones,
            estado_movimiento,
            fecha_movimiento
        ) VALUES (
            1, -- ID del tipo "Alta de Insumo"
            1, -- ID del usuario del sistema
            CONCAT('Alta automática del insumo: ', NEW.nombre_insumo),
            'COMPLETADO',
            NOW()
        ) RETURNING id_movimiento INTO movimiento_id;
        
        -- Insertar detalle del movimiento
        INSERT INTO detalle_movimiento_inventario (
            id_movimiento,
            id_insumo,
            cantidad,
            costo_unitario
        ) VALUES (
            movimiento_id,
            NEW.id_insumo,
            1, -- Cantidad inicial por defecto
            NEW.costo_unitario
        );
        
        RETURN NEW;
    EXCEPTION
        WHEN OTHERS THEN
            -- En caso de error, registrar en logs pero no fallar la inserción del insumo
            RAISE WARNING 'Error al crear movimiento automático para insumo %: %', NEW.id_insumo, SQLERRM;
            RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
CREATE TRIGGER trigger_alta_insumo
    AFTER INSERT ON insumo
    FOR EACH ROW
    EXECUTE FUNCTION registrar_alta_insumo();

-- Comentario para documentación
COMMENT ON FUNCTION registrar_alta_insumo() IS 'Función que registra automáticamente un movimiento de inventario tipo "Alta de Insumo" cuando se crea un nuevo insumo';
COMMENT ON TRIGGER trigger_alta_insumo ON insumo IS 'Trigger que ejecuta el registro automático de movimiento al insertar un insumo';