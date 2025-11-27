# QuickPark

Proyecto QuickPark

## DataBase PostgreSQL

Levanta la base de datos con Docker Compose desde la raíz del proyecto:

```bash
docker-compose up -d
```

Para detener y eliminar contenedores y volúmenes (limpieza completa):

```bash
docker-compose down -v
```

Los scripts de inicialización están en `db/init/`:

- `schema.sql` — creación de tablas
- `seed.sql` — datos iniciales

---

Si necesitas, puedo añadir instrucciones para ejecutar el backend o ejemplos de uso de la API.

- `schema.sql` — creación de tablas
- `seed.sql` — datos iniciales

[![Unit Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml)

[![E2E Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml)