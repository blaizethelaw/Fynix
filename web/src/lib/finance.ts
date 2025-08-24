export function payoffMonths(balance: number, apr: number, payment: number){
  const r = apr / 100 / 12
  if (payment <= balance * r) return Infinity
  let bal = balance, m = 0
  while (bal > 0 && m < 600){
    const interest = bal * r
    const principal = payment - interest
    bal = Math.max(0, bal - principal)
    m++
  }
  return m
}

export function project(principal: number, monthly: number, rate: number, years: number){
  const r = rate / 100 / 12
  let bal = principal
  const data: number[] = [bal]
  for (let m = 1; m <= years * 12; m++){
    bal = bal * (1 + r) + monthly
    data.push(bal)
  }
  return data
}
