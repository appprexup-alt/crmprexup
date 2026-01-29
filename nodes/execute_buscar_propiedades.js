// Nodo: Execute Function - buscar_propiedades
const args = $json.arguments;

let query = `SELECT id, description, location, price, currency, area, status 
             FROM properties 
             WHERE status = 'disponible'`;

const conditions = [];

if (args.location) {
    conditions.push(`location ILIKE '%${args.location}%'`);
}

if (args.max_price) {
    conditions.push(`price <= ${args.max_price}`);
}

if (args.currency) {
    conditions.push(`currency = '${args.currency}'`);
}

if (args.min_area) {
    conditions.push(`area >= ${args.min_area}`);
}

if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
}

query += ' ORDER BY created_at DESC LIMIT 10';

return [{
    json: {
        query: query,
        function_name: 'buscar_propiedades'
    }
}];
