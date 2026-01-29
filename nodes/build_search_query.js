// Nodo Code: Build Search Query
const params = $json.parameters;

let query = "SELECT id, description, location, price, currency, area, status FROM properties WHERE status = 'disponible'";
const conditions = [];

if (params.location) {
    conditions.push(`location ILIKE '%${params.location.replace(/'/g, "''")}%'`);
}

if (params.max_price) {
    conditions.push(`price <= ${parseFloat(params.max_price)}`);
}

if (params.currency) {
    conditions.push(`currency = '${params.currency}'`);
}

if (params.min_area) {
    conditions.push(`area >= ${parseFloat(params.min_area)}`);
}

if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
}

query += ' ORDER BY price ASC LIMIT 10';

return [{
    json: {
        query: query,
        action_type: 'SEARCH_PROPERTIES',
        user_message: $json.user_message
    }
}];
