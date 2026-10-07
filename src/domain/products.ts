export type ProductKind = 'bag' | 'bar' | 'bottle' | 'can' | 'apple' | 'banana' | 'bread' | 'croissant';
export interface Product {
  id: string; name: string; shortName: string; category: string; price: number;
  size: string; description: string; color: string; kind: ProductKind;
  initialStock: number; minStock: number; vegan: boolean;
  position: [number, number, number];
}

// Selbst gestaltete, markenfreie Beispielprodukte. Preise immer in ganzen Cent.
export const products: Product[] = [
  {id:'chips', name:'Kesselchips Meersalz', shortName:'Kesselchips', category:'Chips', price:249, size:'150 g', description:'Knusprige Kartoffelchips, im Kessel geröstet und mit Meersalz verfeinert. Pflanzlicher Snack ohne Milchbestandteile.', color:'#eab447', kind:'bag', initialStock:4, minStock:4, vegan:true, position:[-3.9,1.49,1.9]},
  {id:'paprika', name:'Chips milde Paprika', shortName:'Paprikachips', category:'Chips', price:229, size:'150 g', description:'Goldgelbe Kartoffelchips mit milder Paprika und einer herzhaften, rein pflanzlichen Gewürzmischung.', color:'#d35b3d', kind:'bag', initialStock:10, minStock:3, vegan:true, position:[-3.9,1.49,0.2]},
  {id:'chocolate', name:'Dunkle Schokolade 70 %', shortName:'Dunkle Schokolade', category:'Schokolade', price:219, size:'100 g', description:'Feinherbe Schokolade mit 70 % Kakao, ohne Milch. Eine kleine, intensive Auszeit.', color:'#5b393c', kind:'bar', initialStock:8, minStock:3, vegan:true, position:[-3.9,0.61,1.9]},
  {id:'milk-chocolate', name:'Vollmilchschokolade', shortName:'Vollmilch', category:'Schokolade', price:199, size:'100 g', description:'Zart schmelzende Milchschokolade mit sanften Kakaonoten. Enthält Milch; kann Spuren von Nüssen enthalten.', color:'#8d6a49', kind:'bar', initialStock:9, minStock:3, vegan:false, position:[-3.9,0.61,0.2]},
  {id:'water', name:'Mineralwasser still', shortName:'Mineralwasser', category:'Getränke', price:89, size:'500 ml', description:'Klares, stilles Mineralwasser in einer handlichen Flasche. Alle Beispielpreise sind Endpreise der Demo; kein Pfandprozess.', color:'#82bbc1', kind:'bottle', initialStock:15, minStock:4, vegan:true, position:[-3.9,1.34,-2.0]},
  {id:'juice', name:'Orangendirektsaft', shortName:'Orangensaft', category:'Getränke', price:189, size:'330 ml', description:'Fruchtiger Direktsaft aus sonnengereiften Orangen. 100 % Frucht, ohne zugesetzten Zucker.', color:'#ec9f39', kind:'bottle', initialStock:10, minStock:3, vegan:true, position:[-3.9,0.57,-2.0]},
  {id:'soda', name:'Zitronenlimonade', shortName:'Zitronenlimonade', category:'Getränke', price:149, size:'330 ml', description:'Spritzige Limonade mit frischem Zitronengeschmack. Im Kühlregal besonders erfrischend.', color:'#a4bc68', kind:'can', initialStock:12, minStock:3, vegan:true, position:[-3.9,1.26,-3.4]},
  {id:'apple', name:'Knackige rote Äpfel', shortName:'Rote Äpfel', category:'Obst', price:159, size:'3 Stück', description:'Drei saftige, süß-säuerliche Äpfel. Ein frischer Snack oder eine knackige Ergänzung zum Frühstück.', color:'#bb4c38', kind:'apple', initialStock:12, minStock:3, vegan:true, position:[3.8,1.4,1.7]},
  {id:'banana', name:'Sonnengelbe Bananen', shortName:'Bananen', category:'Obst', price:139, size:'3 Stück', description:'Drei reife Bananen. Natürlich süß und ideal als Snack für unterwegs.', color:'#e2c24c', kind:'banana', initialStock:12, minStock:3, vegan:true, position:[3.8,1.4,0.1]},
  {id:'bread', name:'Rustikales Sauerteigbrot', shortName:'Sauerteigbrot', category:'Backwaren', price:349, size:'500 g', description:'Kräftiges Brot mit aromatischer Kruste aus Roggen, Weizen, Wasser und Sauerteig. Enthält Gluten.', color:'#a7753f', kind:'bread', initialStock:8, minStock:2, vegan:true, position:[3.8,1.35,-1.5]},
  {id:'croissant', name:'Goldenes Buttercroissant', shortName:'Buttercroissant', category:'Backwaren', price:129, size:'1 Stück', description:'Luftiges Croissant mit feinen Butterschichten und goldbrauner Oberfläche. Enthält Milch und Gluten.', color:'#c58b45', kind:'croissant', initialStock:8, minStock:2, vegan:false, position:[3.8,0.48,1.7]}
];
export const productById = Object.fromEntries(products.map(p => [p.id, p])) as Record<string, Product>;
export const money = (cents: number) => new Intl.NumberFormat('de-DE', {style:'currency', currency:'EUR'}).format(cents / 100);
