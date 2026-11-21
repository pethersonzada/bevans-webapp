export function pontoValido(latitude,longitude) {
  return typeof latitude === 'number' && Number.isFinite(latitude) && Math.abs(latitude) <= 90
    && typeof longitude === 'number' && Number.isFinite(longitude) && Math.abs(longitude) <= 180
    && !(latitude === 0 && longitude === 0);
}

export function pontosRotaPublica(rota) {
  if (!rota) return [];
  const points = [
    {nome:rota.origemNome || 'Origem',latitude:rota.origemLatitude,longitude:rota.origemLongitude,tipo:'origem'},
    ...(Array.isArray(rota.paradas) ? rota.paradas.map(p=>({nome:p.nome || 'Parada',latitude:p.latitude,longitude:p.longitude,tipo:'parada'})) : []),
    {nome:rota.destinoNome || 'Destino',latitude:rota.destinoLatitude,longitude:rota.destinoLongitude,tipo:'destino'},
  ];
  return points.filter(p=>pontoValido(p.latitude,p.longitude));
}

export function pontosRoteiroOperacional(roteiro) {
  if (!Array.isArray(roteiro)) return [];
  return roteiro.filter(p=>pontoValido(p.latitude,p.longitude)).map(p=>({
    nome:p.nome || p.tipo || 'Ponto da viagem',
    latitude:p.latitude,longitude:p.longitude,tipo:p.tipo,
  }));
}
