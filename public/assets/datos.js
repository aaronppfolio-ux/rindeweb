/* ================== DATOS: productos de La Colonia (precios del 4 nov 2026) ==================
   s = contenido del empaque (g, ml o unidades) · p = precio C$ · b = se vende por peso (precio por libra)
   st = paso mínimo al pesar (g) · k = nombre corto de la presentación */
const LB = 454;
const P = {
  // Granos y abarrotes
  arroz:{n:'Arroz',c:'g',u:'g',o:[{id:'4030080',d:'Arroz a granel 80/20 · La Colonia',k:'lb',s:LB,p:22.00,b:1},{id:'4030054',d:'Arroz 80/20 bolsa 2 kg · Doña María',k:'bolsa 2 kg',s:2000,p:115.25},{id:'1520122',d:'Arroz 96/4 bolsa 2 kg · Faisán',k:'bolsa 2 kg',s:2000,p:143.50}]},
  frijol:{n:'Frijol rojo',c:'g',u:'g',o:[{id:'4050033',d:'Frijol rojo seda premium · Economax',k:'lb',s:LB,p:35.00,b:1},{id:'4050054',d:'Frijol rojo bolsa 2 lb',k:'bolsa 2 lb',s:907,p:99.75}]},
  frijol_negro:{n:'Frijol negro',c:'g',u:'g',o:[{id:'4050013',d:'Frijol negro bolsa 24 oz',k:'bolsa 680 g',s:680,p:74.75}]},
  lenteja:{n:'Lentejas',c:'g',u:'g',o:[{id:'1130554',d:'Lentejas castellana 500 g',k:'bolsa 500 g',s:500,p:110.00},{id:'1130053',d:'Lentejas extra bolsa 500 g',k:'bolsa 500 g',s:500,p:125.00}]},
  garbanzo:{n:'Garbanzo',c:'g',u:'g',o:[{id:'1130131',d:'Garbanzo 400 g',k:'bolsa 400 g',s:400,p:54.00}]},
  harina_maiz:{n:'Harina de maíz',c:'g',u:'g',o:[{id:'4090025',d:'Harina de maíz 410 g · Maseca',k:'bolsa 410 g',s:410,p:33.00},{id:'4090041',d:'Harina de maíz 4.5 lb · Maseca',k:'bolsa 4.5 lb',s:2041,p:168.50}]},
  harina_trigo:{n:'Harina de trigo',c:'g',u:'g',o:[{id:'3080027',d:'Harina de trigo suave 454 g · Espiga Dorada',k:'bolsa 1 lb',s:454,p:20.75},{id:'3080024',d:'Harina de trigo 2 lb · Espiga Dorada',k:'bolsa 2 lb',s:907,p:40.50}]},
  avena:{n:'Avena en hojuelas',c:'g',u:'g',o:[{id:'1220283',d:'Avena en hojuelas 360 g · Sasa',k:'bolsa 360 g',s:360,p:45.00},{id:'1220163',d:'Avena en hojuelas bolsa 3 lb',k:'bolsa 3 lb',s:1361,p:99.50}]},
  pinolillo:{n:'Pinolillo',c:'g',u:'g',o:[{id:'4200109',d:'Pinolillo 380 g · Sasa',k:'bolsa 380 g',s:380,p:56.00},{id:'4200105',d:'Pinolillo 1 kg · Sasa',k:'bolsa 1 kg',s:1000,p:140.00}]},
  spaghetti:{n:'Espagueti',c:'g',u:'g',o:[{id:'1300421',d:'Pasta spaghetti 200 g',k:'paquete 200 g',s:200,p:24.25},{id:'1301067',d:'Pasta spaghetti 500 g',k:'paquete 500 g',s:500,p:58.75}]},
  coditos:{n:'Coditos',c:'g',u:'g',o:[{id:'1300708',d:'Pasta coditos 200 g',k:'paquete 200 g',s:200,p:29.00}]},
  macarron:{n:'Macarrón',c:'g',u:'g',o:[{id:'1300047',d:'Pasta macarrón 250 g · Roma',k:'paquete 250 g',s:250,p:36.00}]},
  fideo:{n:'Fideo cabello de ángel',c:'g',u:'g',o:[{id:'1300024',d:'Pasta cabello de ángel 250 g · Roma',k:'paquete 250 g',s:250,p:49.00}]},
  tortilla:{n:'Tortilla de maíz',c:'g',u:'u',o:[{id:'4140031',d:'Tortilla de maíz paquete 20 u',k:'paquete 20 u',s:20,p:49.50},{id:'4140027',d:'Tortilla de maíz 50 u · Guadalupana',k:'paquete 50 u',s:50,p:106.75},{id:'4140026',d:'Tortilla de maíz 10 u',k:'paquete 10 u',s:10,p:37.50}]},
  tortilla_harina:{n:'Tortilla de harina',c:'g',u:'u',o:[{id:'1410066',d:'Tortilla de harina 10 u',k:'paquete 10 u',s:10,p:36.00}]},
  pan:{n:'Pan de molde',c:'g',u:'u',o:[{id:'4070604',d:'Pan de molde blanco grande 670 g (≈22 rebanadas)',k:'bolsa 670 g',s:22,p:68.80}]},
  aceite:{n:'Aceite',c:'g',u:'ml',o:[{id:'4020186',d:'Aceite vegetal 700 ml · Mazola',k:'botella 700 ml',s:700,p:80.04},{id:'4020227',d:'Aceite de soya 1400 ml · Ideal',k:'botella 1.4 L',s:1400,p:168.15}]},
  azucar:{n:'Azúcar',c:'g',u:'g',o:[{id:'4040032',d:'Azúcar sulfitada 400 g · Monte Rosa',k:'bolsa 400 g',s:400,p:14.00},{id:'4040018',d:'Azúcar sulfitada 2 kg · Monte Rosa',k:'bolsa 2 kg',s:2000,p:73.00}]},
  sal:{n:'Sal',c:'g',u:'g',o:[{id:'4060034',d:'Sal fina 454 g · Atlántida',k:'bolsa 454 g',s:454,p:12.50}]},
  consome:{n:'Consomé de pollo',c:'g',u:'u',o:[{id:'1070389',d:'Consomé de pollo cubitos 10 g × 5',k:'paquete 5 u',s:5,p:23.50}]},
  achiote:{n:'Achiote',c:'g',u:'g',o:[{id:'1070397',d:'Achiote en polvo 13 g',k:'bolsita 13 g',s:13,p:25.25}]},
  comino:{n:'Comino',c:'g',u:'g',o:[{id:'1070400',d:'Comino molido 13 g',k:'bolsita 13 g',s:13,p:30.25}]},
  pimienta:{n:'Pimienta negra',c:'g',u:'g',o:[{id:'1070386',d:'Pimienta negra molida 11 g',k:'bolsita 11 g',s:11,p:25.25}]},
  oregano:{n:'Orégano',c:'g',u:'g',o:[{id:'1070355',d:'Orégano 9 g',k:'bolsita 9 g',s:9,p:31.75}]},
  salsa_inglesa:{n:'Salsa inglesa',c:'g',u:'ml',o:[{id:'1050733',d:'Salsa inglesa 5 oz',k:'botella 148 ml',s:148,p:29.00}]},
  vinagre:{n:'Vinagre',c:'g',u:'ml',o:[{id:'1090490',d:'Vinagre blanco 750 ml',k:'botella 750 ml',s:750,p:46.50}]},
  pasta_tomate:{n:'Pasta de tomate',c:'g',u:'g',o:[{id:'1051023',d:'Pasta de tomate 90 g',k:'sobre 90 g',s:90,p:29.00},{id:'1051024',d:'Pasta de tomate 180 g',k:'sobre 180 g',s:180,p:52.00}]},
  ketchup:{n:'Salsa de tomate',c:'g',u:'g',o:[{id:'1010235',d:'Salsa de tomate doypack 385 g',k:'doypack 385 g',s:385,p:56.00}]},
  mayonesa:{n:'Mayonesa',c:'g',u:'g',o:[{id:'1030144',d:'Mayonesa flexi pack 380 g',k:'bolsa 380 g',s:380,p:111.35}]},
  sardina:{n:'Sardina en tomate',c:'g',u:'g',o:[{id:'1320029',d:'Sardina en salsa de tomate 155 g · Sardimar',k:'lata 155 g',s:155,p:40.42},{id:'1320015',d:'Sardina en salsa de tomate 155 g · Economax',k:'lata 155 g',s:155,p:42.50}]},
  atun:{n:'Atún en agua',c:'g',u:'g',o:[{id:'1320715',d:'Atún lomo trocitos en agua 140 g',k:'lata 140 g',s:140,p:45.69},{id:'1320724',d:'Atún en agua 142 g · Bahía',k:'lata 142 g',s:142,p:57.25}]},
  maiz_lata:{n:'Maíz dulce',c:'g',u:'g',o:[{id:'1130135',d:'Maíz dulce lata 184 g',k:'lata 184 g',s:184,p:49.00}]},

  // Carnes y embutidos
  pollo:{n:'Pierna con muslo de pollo',c:'c',u:'g',o:[{id:'6030209',d:'Pierna con muslo (por libra)',k:'lb',s:LB,p:38.50,b:1,st:113.5},{id:'6030083',d:'Pierna con muslo fresco · Tip-Top',k:'lb',s:LB,p:67.75,b:1,st:113.5}]},
  pechuga:{n:'Pechuga de pollo',c:'c',u:'g',o:[{id:'1700022',d:'Pechuga de pollo fresca · Tip-Top',k:'lb',s:LB,p:95.62,b:1,st:113.5}]},
  higado_pollo:{n:'Hígado de pollo',c:'c',u:'g',o:[{id:'6030166',d:'Hígado de pollo 1 lb · Rico',k:'bandeja 1 lb',s:LB,p:27.90}]},
  carne_molida:{n:'Carne molida de res',c:'c',u:'g',o:[{id:'6010056',d:'Carne molida corriente 80/20',k:'lb',s:LB,p:124.30,b:1,st:113.5}]},
  res_posta:{n:'Posta de res',c:'c',u:'g',o:[{id:'6080097',d:'Posta de pierna de res',k:'lb',s:LB,p:184.75,b:1,st:113.5}]},
  bistec:{n:'Bistec de res',c:'c',u:'g',o:[{id:'6080240',d:'Bistec majado',k:'lb',s:LB,p:197.25,b:1,st:113.5}]},
  costilla_res:{n:'Costilla de res',c:'c',u:'g',o:[{id:'6080187',d:'Costilla alta de res (short ribs)',k:'lb',s:LB,p:122.07,b:1,st:113.5}]},
  hueso_res:{n:'Hueso de res',c:'c',u:'g',o:[{id:'6080181',d:'Hueso corriente de res',k:'lb',s:LB,p:31.00,b:1,st:113.5}]},
  mondongo:{n:'Mondongo',c:'c',u:'g',o:[{id:'6080169',d:'Mondongo con patas',k:'lb',s:LB,p:99.50,b:1,st:113.5}]},
  cerdo:{n:'Carne de cerdo',c:'c',u:'g',o:[{id:'1610318',d:'Trozos de cerdo (importado)',k:'lb',s:LB,p:84.64,b:1,st:113.5},{id:'6021023',d:'Posta de cerdo (importada)',k:'lb',s:LB,p:92.00,b:1,st:113.5}]},
  chuleta:{n:'Chuleta de cerdo',c:'c',u:'g',o:[{id:'1730005',d:'Lomo de cerdo con hueso (chuleta)',k:'lb',s:LB,p:78.43,b:1,st:113.5}]},
  costilla:{n:'Costilla de cerdo',c:'c',u:'g',o:[{id:'6020047',d:'Costilla de cerdo importada',k:'lb',s:LB,p:126.90,b:1,st:113.5}]},
  curvina:{n:'Filete de curvina',c:'c',u:'g',o:[{id:'6050210',d:'Filete de curvina importada 1 lb',k:'paquete 1 lb',s:LB,p:92.00}]},
  tilapia:{n:'Filete de tilapia',c:'c',u:'g',o:[{id:'6050131',d:'Filete de tilapia importado',k:'lb',s:LB,p:219.50,b:1,st:113.5}]},
  chorizo:{n:'Chorizo criollo',c:'c',u:'g',o:[{id:'1540547',d:'Chorizo criollo 227 g',k:'paquete 227 g',s:227,p:47.00},{id:'1541975',d:'Chorizo criollo 454 g · Delmor',k:'paquete 454 g',s:454,p:120.00}]},
  salchicha:{n:'Salchicha',c:'c',u:'g',o:[{id:'1540179',d:'Salchicha 250 g',k:'paquete 250 g',s:250,p:60.00},{id:'1540034',d:'Salchicha hot dog 227 g',k:'paquete 227 g',s:227,p:59.00}]},
  mortadela:{n:'Mortadela',c:'c',u:'g',o:[{id:'1541860',d:'Mortadela económica 225 g',k:'paquete 225 g',s:225,p:58.05}]},
  jamon:{n:'Jamón prensado',c:'c',u:'g',o:[{id:'1540035',d:'Jamón prensado 227 g',k:'paquete 227 g',s:227,p:85.00}]},

  // Lácteos y huevos
  huevo:{n:'Huevos',c:'l',u:'u',o:[{id:'4150049',d:'Huevo rojo ½ docena · La Barranca',k:'½ docena',s:6,p:52.50},{id:'4150017',d:'Huevos rojos 1 docena · La Barranca',k:'docena',s:12,p:99.00},{id:'4150028',d:'Huevos rojos ½ cajilla (15) · El Granjero',k:'½ cajilla',s:15,p:122.00},{id:'4150029',d:'Huevos rojos cajilla (30) · El Granjero',k:'cajilla',s:30,p:226.00}]},
  queso:{n:'Queso para freír',c:'l',u:'g',o:[{id:'1350778',d:'Queso especial para freír 400 g · Palmito',k:'paquete 400 g',s:400,p:133.42}]},
  queso_seco:{n:'Queso seco',c:'l',u:'g',o:[{id:'1351446',d:'Queso seco chontaleño 400 g',k:'paquete 400 g',s:400,p:113.40}]},
  cuajada:{n:'Cuajada',c:'l',u:'g',o:[{id:'1350522',d:'Cuajada seca ahumada 227 g',k:'paquete 227 g',s:227,p:80.77}]},
  quesillo:{n:'Quesillo',c:'l',u:'g',o:[{id:'1351704',d:'Quesillo trenza 320 g · Norteña',k:'paquete 320 g',s:320,p:210.00},{id:'1350552',d:'Quesillo bolsa 450 g',k:'bolsa 450 g',s:450,p:210.00}]},
  crema:{n:'Crema',c:'l',u:'g',o:[{id:'1361330',d:'Crema ácida 227 g',k:'bolsa 227 g',s:227,p:26.75},{id:'1510096',d:'Crema ácida 420 g · La Perfecta',k:'bolsa 420 g',s:420,p:51.50}]},
  margarina:{n:'Margarina',c:'l',u:'g',o:[{id:'1380166',d:'Margarina barra 80 g',k:'barra 80 g',s:80,p:15.00}]},
  leche:{n:'Leche',c:'l',u:'ml',o:[{id:'4100130',d:'Leche entera bolsa 450 ml · Eskimo',k:'bolsa 450 ml',s:450,p:25.00},{id:'4100113',d:'Leche entera bolsa 900 ml · Eskimo',k:'bolsa 900 ml',s:900,p:44.50}]},

  // Frutas y verduras
  papa:{n:'Papa',c:'v',u:'g',o:[{id:'5030010',d:'Papa blanca',k:'lb',s:LB,p:72.50,b:1}]},
  tomate:{n:'Tomate',c:'v',u:'g',o:[{id:'5010395',d:'Tomate criollo',k:'lb',s:LB,p:41.95,b:1}]},
  cebolla:{n:'Cebolla',c:'v',u:'g',o:[{id:'5010081',d:'Cebolla amarilla',k:'lb',s:LB,p:45.00,b:1}]},
  zanahoria:{n:'Zanahoria',c:'v',u:'g',o:[{id:'5030022',d:'Zanahoria de primera',k:'lb',s:LB,p:59.95,b:1}]},
  ajo:{n:'Ajo',c:'v',u:'g',o:[{id:'5010001',d:'Ajo',k:'lb',s:LB,p:160.00,b:1,st:28.4}]},
  chiltoma:{n:'Chiltoma',c:'v',u:'u',o:[{id:'5010021',d:'Chiltoma de cocinar docena',k:'docena',s:12,p:49.00},{id:'5010469',d:'Chile dulce malla 4 u',k:'malla 4 u',s:4,p:61.56}]},
  repollo:{n:'Repollo',c:'v',u:'g',o:[{id:'5010049',d:'Repollo verde (≈1 kg)',k:'unidad',s:1000,p:83.50}]},
  pepino:{n:'Pepino',c:'v',u:'g',o:[{id:'5010599',d:'Pepino (≈300 g)',k:'unidad',s:300,p:21.25}]},
  brocoli:{n:'Brócoli',c:'v',u:'g',o:[{id:'5010010',d:'Brócoli',k:'lb',s:LB,p:92.75,b:1}]},
  quequisque:{n:'Quequisque',c:'v',u:'g',o:[{id:'5010365',d:'Quequisque',k:'lb',s:LB,p:98.25,b:1}]},
  yuca:{n:'Yuca',c:'v',u:'g',o:[{id:'5010055',d:'Yuca parafinada',k:'lb',s:LB,p:19.75,b:1}]},
  malanga:{n:'Malanga',c:'v',u:'g',o:[{id:'5010210',d:'Malanga',k:'lb',s:LB,p:28.75,b:1}]},
  ayote:{n:'Ayote',c:'v',u:'g',o:[{id:'5010006',d:'Ayote sazón',k:'lb',s:LB,p:29.25,b:1}]},
  chayote:{n:'Chayote',c:'v',u:'u',o:[{id:'5010016',d:'Chayote verde nacional',k:'unidad',s:1,p:25.00}]},
  pipian:{n:'Pipián',c:'v',u:'u',o:[{id:'5010042',d:'Pipián',k:'unidad',s:1,p:33.75}]},
  chilote:{n:'Chilote',c:'v',u:'u',o:[{id:'5010020',d:'Chilotes docena',k:'docena',s:12,p:53.00}]},
  platano:{n:'Plátano',c:'v',u:'u',o:[{id:'5010489',d:'Plátano verde o maduro',k:'unidad',s:1,p:16.50},{id:'5010569',d:'Plátano malla 6 u',k:'malla 6 u',s:6,p:73.95}]},
  culantro:{n:'Culantro',c:'v',u:'u',o:[{id:'5010025',d:'Culantro (moño)',k:'moño',s:1,p:10.25}]},
  zuquini:{n:'Zuquini',c:'v',u:'u',o:[{id:'5010222',d:'Zuquini',k:'unidad',s:1,p:49.95}]},
  remolacha:{n:'Remolacha',c:'v',u:'g',o:[{id:'5010048',d:'Remolacha importada',k:'lb',s:LB,p:58.00,b:1}]},
  limon:{n:'Limón',c:'v',u:'u',o:[{id:'5020454',d:'Limón sin semilla',k:'unidad',s:1,p:10.50},{id:'5020017',d:'Limón criollo malla 12 u',k:'malla 12 u',s:12,p:59.25}]},
  naranja_agria:{n:'Naranja agria',c:'v',u:'u',o:[{id:'5020030',d:'Naranja agria',k:'unidad',s:1,p:18.00}]},
  banano:{n:'Banano',c:'v',u:'u',o:[{id:'5020434',d:'Banano maduro',k:'unidad',s:1,p:3.00}]},
  papaya:{n:'Papaya',c:'v',u:'g',o:[{id:'5020103',d:'Papaya hawaiana',k:'lb',s:LB,p:24.75,b:1}]},
  pina:{n:'Piña',c:'v',u:'u',o:[{id:'5020035',d:'Piña criolla',k:'unidad',s:1,p:79.95}]},
  mandarina:{n:'Mandarina',c:'v',u:'u',o:[{id:'5040086',d:'Mandarina importada',k:'unidad',s:1,p:31.75}]},
  aguacate:{n:'Aguacate',c:'v',u:'u',o:[{id:'5010494',d:'Aguacate grande',k:'unidad',s:1,p:76.75}]},
};
const PANTRY = new Set(['sal','aceite','azucar','consome','achiote','comino','pimienta','oregano','salsa_inglesa','vinagre']);
const CATS = {c:'Carnes y embutidos', l:'Lácteos y huevos', g:'Granos y abarrotes', v:'Frutas y verduras'};
const PROT = {pollo:'Pollo', res:'Res', cerdo:'Cerdo', pescado:'Pescado', huevo:'Huevo', embutido:'Embutidos', sincarne:'Sin carne'};
const STYLES = {tipico:'Típico nica', sopa:'Sopas', rapido:'Rápido', ligero:'Ligero', pasta:'Pastas'};
const FOCUS = {proteina:'Proteína', vegetal:'Vegetales', cereal:'Cereal'};
const MEALS = [['d','Desayuno'],['a','Almuerzo'],['c','Cena']];

/* ================== RECETAS (cantidades por persona) ==================
   p = proteína principal · t = enfoque · e = estilo · rápido = 20 min o menos */
const R = [
 // DESAYUNOS
 {id:'pinto-huevo',m:'d',n:'Gallo pinto con huevo frito',p:'huevo',t:['cereal','proteina'],e:['tipico'],min:20,i:[['arroz',60],['frijol',50],['huevo',1],['cebolla',15],['chiltoma',.25],['aceite',12]],
  s:['Cociná los frijoles con sal hasta que estén suaves. Del día anterior quedan mejor.','Cociná el arroz con un chorrito de aceite, cebolla y agua.','Sofreí cebolla y chiltoma picadas, agregá arroz y frijoles con un poco de su caldo y dorá.','Freí el huevo y servilo encima.']},
 {id:'pinto-queso',m:'d',n:'Gallo pinto con queso frito y crema',p:'sincarne',t:['cereal'],e:['tipico'],min:20,i:[['arroz',60],['frijol',50],['queso',60],['crema',30],['cebolla',15],['aceite',15]],
  s:['Prepará el gallo pinto: sofreí cebolla, agregá arroz y frijoles cocidos y dorá.','Cortá el queso en rodajas de 1 cm.','Freílo en sartén caliente hasta que dore por ambos lados.','Serví con una cucharada de crema.']},
 {id:'desayuno-nica',m:'d',n:'Desayuno nica completo',p:'huevo',t:['proteina','cereal'],e:['tipico'],min:25,i:[['arroz',50],['frijol',40],['huevo',1],['platano',.5],['crema',25],['tortilla',2],['aceite',18]],
  s:['Prepará el gallo pinto con arroz y frijoles cocidos.','Freí el maduro en tajadas.','Freí el huevo.','Serví todo con crema y tortilla caliente.']},
 {id:'rancheros',m:'d',n:'Huevos rancheros con tortilla',p:'huevo',t:['proteina','vegetal'],e:[],min:15,i:[['huevo',2],['tomate',70],['cebolla',20],['chiltoma',.25],['tortilla',2],['aceite',8]],
  s:['Picá tomate, cebolla y chiltoma.','Sofreí cebolla y chiltoma, luego el tomate hasta que suelte su jugo. Sazoná.','Quebrá los huevos encima y tapá 3 minutos.','Calentá las tortillas en comal y serví.']},
 {id:'avena',m:'d',n:'Avena con leche y banano',p:'sincarne',t:['cereal'],e:['ligero'],min:10,i:[['avena',50],['leche',220],['azucar',15],['banano',1]],
  s:['Calentá la leche con un poco de agua.','Agregá la avena y revolvé a fuego bajo 5 minutos.','Endulzá al gusto.','Serví con banano en rodajas.']},
 {id:'pinolillo',m:'d',n:'Pinolillo con tortilla y queso',p:'sincarne',t:['cereal'],e:['tipico'],min:10,i:[['pinolillo',35],['azucar',15],['tortilla',2],['queso',40]],
  s:['Disolvé el pinolillo en un vaso de agua fría con azúcar.','Batí bien para que no queden grumos.','Calentá las tortillas con el queso encima.']},
 {id:'platano-huevo',m:'d',n:'Maduro frito con huevo y crema',p:'huevo',t:['proteina'],e:['tipico'],min:15,i:[['platano',1],['huevo',1],['crema',30],['aceite',15]],
  s:['Pelá el maduro y cortalo en tajadas diagonales.','Freílo hasta que esté dorado y suave.','Freí o revolvé el huevo.','Serví con la crema.']},
 {id:'huevo-salchicha',m:'d',n:'Revuelto de huevo con salchicha',p:'embutido',t:['proteina'],e:[],min:12,i:[['huevo',2],['salchicha',50],['tomate',40],['cebolla',15],['tortilla',2],['aceite',8]],
  s:['Dorá la salchicha en rodajas.','Agregá cebolla y tomate picados, 2 minutos.','Echá los huevos batidos con sal y revolvé.','Serví con tortillas.']},
 {id:'frijoles-molidos',m:'d',n:'Frijoles molidos con queso y tortilla',p:'sincarne',t:['cereal'],e:['tipico'],min:15,i:[['frijol',60],['tortilla',2],['queso_seco',30],['crema',20],['aceite',8]],
  s:['Licuá los frijoles cocidos con un poco de su caldo.','Freílos en sartén aplastando hasta que espesen.','Serví con queso seco rallado, crema y tortillas.']},
 {id:'huevo-chorizo',m:'d',n:'Huevo con chorizo y frijoles',p:'embutido',t:['proteina'],e:['tipico'],min:15,i:[['huevo',1],['chorizo',40],['frijol',40],['tortilla',2],['aceite',5]],
  s:['Desmoroná el chorizo en la sartén caliente.','Cuando suelte su grasa, agregá el huevo y revolvé.','Calentá los frijoles y serví con tortillas.']},
 {id:'tortilla-cuajada',m:'d',n:'Tortilla con cuajada, crema y frijoles',p:'sincarne',t:['cereal'],e:['tipico','rapido'],min:10,i:[['tortilla',2],['cuajada',45],['crema',25],['frijol',40]],
  s:['Calentá los frijoles cocidos.','Calentá las tortillas en comal.','Serví con la cuajada en trozos y crema.']},
 {id:'sandwich-huevo',m:'d',n:'Sándwich de huevo y jamón',p:'embutido',t:['proteina','cereal'],e:['rapido'],min:10,i:[['pan',2],['huevo',1],['jamon',30],['tomate',25],['margarina',6]],
  s:['Untá margarina al pan y tostalo en sartén.','Freí el huevo y calentá el jamón.','Armá el sándwich con rodajas de tomate.']},
 {id:'panqueques',m:'d',n:'Panqueques caseros con banano',p:'sincarne',t:['cereal'],e:[],min:20,i:[['harina_trigo',60],['huevo',.5],['leche',90],['azucar',12],['margarina',8],['banano',1]],
  s:['Mezclá harina, azúcar, una pizca de sal, el huevo y la leche hasta tener una masa lisa.','Engrasá la sartén con margarina.','Cociná porciones pequeñas hasta que salgan burbujas, voltealas.','Serví con banano.']},
 {id:'pinto-mortadela',m:'d',n:'Gallo pinto con mortadela frita',p:'embutido',t:['cereal','proteina'],e:['tipico'],min:15,i:[['arroz',55],['frijol',45],['mortadela',50],['cebolla',10],['aceite',10]],
  s:['Prepará el gallo pinto.','Freí la mortadela en rodajas hasta que dore en las orillas.','Serví junto con tortilla si querés.']},
 {id:'tortilla-papa',m:'d',n:'Tortilla de huevo con papa',p:'huevo',t:['proteina','vegetal'],e:[],min:20,i:[['huevo',2],['papa',90],['cebolla',20],['aceite',12]],
  s:['Cortá la papa en cuadritos y freíla a fuego medio con la cebolla hasta que esté suave.','Batí los huevos con sal y echalos sobre la papa.','Cociná tapado a fuego bajo y volteá con un plato.']},
 {id:'frutas-avena',m:'d',n:'Ensalada de frutas con avena',p:'sincarne',t:['vegetal'],e:['ligero','rapido'],min:10,i:[['papaya',150],['banano',1],['mandarina',.5],['avena',20],['limon',.25]],
  s:['Pelá y cortá la papaya y el banano.','Agregá los gajos de mandarina y unas gotas de limón.','Espolvoreá la avena por encima.']},
 {id:'quesadilla-jamon',m:'d',n:'Quesadilla de harina con jamón y queso',p:'embutido',t:['cereal'],e:['rapido'],min:10,i:[['tortilla_harina',2],['jamon',35],['queso',35],['margarina',5]],
  s:['Poné jamón y queso rallado en una tortilla y tapá con otra.','Doralas en sartén con un poco de margarina, 2 minutos por lado.','Cortá en triángulos.']},
 {id:'chayote-huevo',m:'d',n:'Chayote guisado con huevo',p:'huevo',t:['vegetal','proteina'],e:['ligero'],min:20,i:[['chayote',.5],['huevo',1],['tomate',40],['cebolla',15],['tortilla',2],['aceite',8]],
  s:['Pelá el chayote y cortalo en cuadritos.','Sofreí cebolla y tomate, agregá el chayote con un poco de agua y tapá 8 minutos.','Agregá el huevo batido y revolvé.','Serví con tortilla.']},

 // ALMUERZOS
 {id:'pollo-guisado',m:'a',n:'Pollo guisado con arroz',p:'pollo',t:['proteina','vegetal'],e:['tipico'],min:45,i:[['pollo',220],['papa',100],['zanahoria',50],['tomate',50],['cebolla',30],['chiltoma',.25],['ajo',4],['arroz',70],['aceite',10]],
  s:['Sazoná el pollo con sal y ajo machacado.','Doralo en una olla con aceite.','Agregá cebolla, chiltoma y tomate; luego papa y zanahoria en trozos.','Cubrí con agua y cociná tapado 30 minutos.','Serví con arroz blanco.']},
 {id:'arroz-pollo',m:'a',n:'Arroz con pollo',p:'pollo',t:['cereal','proteina'],e:['tipico'],min:45,i:[['arroz',85],['pechuga',120],['zanahoria',40],['chiltoma',.25],['cebolla',25],['ajo',3],['achiote',.5],['aceite',10]],
  s:['Cociná la pechuga en agua con sal, cebolla y ajo. Guardá el caldo y deshilachá el pollo.','Sofreí cebolla, chiltoma y zanahoria en cuadritos con el achiote.','Agregá el arroz y dorá 2 minutos.','Echá el doble de caldo y el pollo; tapá a fuego bajo 20 minutos.']},
 {id:'pollo-tajadas',m:'a',n:'Pollo frito con tajadas y repollo',p:'pollo',t:['proteina'],e:['tipico'],min:40,i:[['pollo',220],['platano',1],['repollo',60],['tomate',30],['vinagre',10],['harina_trigo',15],['aceite',30]],
  s:['Sazoná el pollo con sal y ajo, pasalo por harina.','Freílo a fuego medio 12–15 minutos por lado.','Freí tajadas finas de plátano verde.','Serví con repollo y tomate picados con vinagre.']},
 {id:'pollo-achiote',m:'a',n:'Pollo achiotado con arroz',p:'pollo',t:['proteina'],e:['tipico'],min:50,i:[['pollo',220],['achiote',1],['naranja_agria',.5],['ajo',4],['cebolla',25],['arroz',70],['aceite',8]],
  s:['Mezclá achiote, jugo de naranja agria, ajo machacado y sal.','Marinálo el pollo en esa mezcla 20 minutos.','Cocinalo tapado en sartén con cebolla y un poco de agua, 30 minutos.','Serví con arroz.']},
 {id:'higado',m:'a',n:'Hígado encebollado con arroz',p:'pollo',t:['proteina'],e:['tipico'],min:25,i:[['higado_pollo',130],['cebolla',70],['tomate',40],['salsa_inglesa',6],['arroz',70],['aceite',10]],
  s:['Lavá y secá el hígado; sazoná con sal y pimienta.','Doralo 3 minutos por lado y sacalo.','En la misma sartén sofreí la cebolla en aros y el tomate con la salsa inglesa.','Regresá el hígado 2 minutos y serví con arroz.']},
 {id:'sopa-pollo',m:'a',n:'Sopa de pollo con verduras',p:'pollo',t:['vegetal','proteina'],e:['sopa','tipico'],min:60,i:[['pollo',150],['papa',100],['zanahoria',60],['quequisque',70],['chilote',1],['repollo',60],['cebolla',20],['chiltoma',.25],['culantro',.2],['consome',.5]],
  s:['Hervé el pollo con cebolla, chiltoma, consomé y sal 20 minutos.','Agregá quequisque, papa, zanahoria y chilote en trozos.','Cuando todo esté suave, sumá repollo y culantro 5 minutos.','Serví bien caliente.']},
 {id:'carne-molida',m:'a',n:'Carne molida en salsa con arroz',p:'res',t:['proteina'],e:[],min:30,i:[['carne_molida',110],['papa',80],['tomate',60],['cebolla',30],['ajo',3],['arroz',70],['aceite',8]],
  s:['Sofreí cebolla y ajo.','Agregá la carne molida y cociná hasta que cambie de color.','Sumá tomate picado, papa en cuadritos, agua y sal.','Cociná tapado 15 minutos y serví con arroz.']},
 {id:'bistec',m:'a',n:'Bistec encebollado',p:'res',t:['proteina'],e:['tipico'],min:30,i:[['bistec',140],['cebolla',80],['tomate',50],['salsa_inglesa',8],['ajo',3],['arroz',70],['aceite',10]],
  s:['Sazoná el bistec con sal, ajo y salsa inglesa.','Doralo en sartén caliente 3 minutos por lado.','Agregá cebolla en aros y tomate, tapá y cociná 10 minutos.','Serví con arroz.']},
 {id:'sopa-res',m:'a',n:'Sopa de res',p:'res',t:['vegetal','proteina'],e:['sopa','tipico'],min:90,i:[['costilla_res',170],['yuca',100],['quequisque',60],['chayote',.3],['chilote',1],['zanahoria',40],['platano',.3],['repollo',50],['culantro',.2],['cebolla',20],['chiltoma',.25]],
  s:['Hervé la costilla con sal, cebolla y chiltoma 50 minutos.','Agregá yuca, quequisque, zanahoria, plátano y chilote.','A los 15 minutos sumá chayote y repollo.','Terminá con culantro picado.']},
 {id:'sopa-mondongo',m:'a',n:'Sopa de mondongo',p:'res',t:['proteina','vegetal'],e:['sopa','tipico'],min:120,i:[['mondongo',150],['hueso_res',60],['yuca',100],['papa',60],['chayote',.3],['chilote',.5],['cebolla',20],['chiltoma',.25],['culantro',.2],['naranja_agria',.5]],
  s:['Lavá el mondongo con naranja agria y sal; cortalo en trozos.','Cocinalo con el hueso, cebolla y chiltoma hasta que esté suave (1 h 30 en olla normal).','Agregá yuca, papa, chayote y chilote.','Terminá con culantro.']},
 {id:'albondigas',m:'a',n:'Sopa de albóndigas',p:'res',t:['proteina','vegetal'],e:['sopa','tipico'],min:50,i:[['carne_molida',100],['harina_maiz',20],['huevo',.25],['papa',80],['chayote',.3],['zanahoria',40],['chilote',.5],['culantro',.2],['cebolla',20],['chiltoma',.25]],
  s:['Mezclá la carne con harina de maíz, huevo, sal y cebolla picada; formá bolitas.','Hervé agua con chiltoma, cebolla y sal.','Agregá las verduras y luego las albóndigas.','Cociná 20 minutos y terminá con culantro.']},
 {id:'espaguetis',m:'a',n:'Espaguetis en salsa con carne',p:'res',t:['cereal','proteina'],e:['pasta'],min:30,i:[['spaghetti',100],['carne_molida',80],['tomate',110],['cebolla',25],['ajo',4],['oregano',.3],['aceite',8]],
  s:['Cociná la pasta en agua con sal.','Licuá los tomates.','Sofreí cebolla y ajo, agregá la carne y dorala.','Echá el tomate, orégano y sal; cociná 10 minutos y mezclá con la pasta.']},
 {id:'pipian-carne',m:'a',n:'Pipián guisado con carne molida',p:'res',t:['vegetal','proteina'],e:[],min:30,i:[['pipian',.5],['carne_molida',70],['tomate',40],['cebolla',20],['arroz',60],['aceite',8]],
  s:['Cortá el pipián en cuadritos.','Dorá la carne con cebolla.','Agregá tomate y pipián, tapá y cociná 12 minutos.','Serví con arroz.']},
 {id:'costilla',m:'a',n:'Costilla de cerdo en salsa con papas',p:'cerdo',t:['proteina'],e:[],min:60,i:[['costilla',230],['papa',120],['tomate',60],['cebolla',30],['ajo',4],['arroz',60],['aceite',8]],
  s:['Hervé la costilla con sal y ajo 30 minutos.','Sofreí cebolla y tomate en otra olla.','Pasá la costilla a la salsa con algo de su caldo y las papas.','Cociná 20 minutos más y serví con arroz.']},
 {id:'cerdo-asado',m:'a',n:'Cerdo asado con tajadas y repollo',p:'cerdo',t:['proteina','vegetal'],e:['tipico'],min:40,i:[['cerdo',160],['platano',1],['repollo',80],['tomate',40],['limon',.5],['ajo',3],['aceite',18]],
  s:['Marinálo con sal, ajo y limón 15 minutos.','Asalo en sartén o plancha hasta que esté bien cocido.','Freí tajadas finas de plátano verde.','Serví con repollo y tomate picados con limón.']},
 {id:'chancho-yuca',m:'a',n:'Chancho con yuca',p:'cerdo',t:['proteina'],e:['tipico'],min:50,i:[['cerdo',150],['yuca',180],['repollo',70],['tomate',40],['naranja_agria',.5],['vinagre',8],['aceite',15]],
  s:['Marinálo el cerdo con naranja agria, ajo y sal.','Cocinalo en un poco de agua hasta que se seque y luego dorálo en su grasa.','Cociná la yuca en agua con sal hasta que esté suave.','Serví con ensalada de repollo y tomate con vinagre.']},
 {id:'chuleta',m:'a',n:'Chuleta de cerdo con arroz y ensalada',p:'cerdo',t:['proteina'],e:[],min:30,i:[['chuleta',180],['arroz',70],['repollo',60],['tomate',40],['limon',.5],['ajo',3],['aceite',10]],
  s:['Sazoná las chuletas con sal, ajo y limón.','Cocinalas en sartén 5–6 minutos por lado.','Serví con arroz y ensalada de repollo y tomate.']},
 {id:'curvina',m:'a',n:'Curvina frita con ensalada',p:'pescado',t:['proteina','vegetal'],e:[],min:30,i:[['curvina',150],['repollo',90],['tomate',40],['limon',1],['arroz',70],['aceite',20]],
  s:['Sazoná el pescado con sal, ajo y limón.','Freílo 4 minutos por lado.','Picá repollo y tomate y aliñá con limón.','Serví con arroz.']},
 {id:'tilapia-ajillo',m:'a',n:'Tilapia al ajillo',p:'pescado',t:['proteina'],e:['ligero'],min:25,i:[['tilapia',150],['ajo',8],['margarina',12],['limon',.5],['arroz',70],['pepino',80]],
  s:['Sazoná la tilapia con sal y limón.','Derretí la margarina y dorá el ajo picado sin quemarlo.','Cociná la tilapia en esa mantequilla 3 minutos por lado.','Serví con arroz y pepino en rodajas.']},
 {id:'sardina',m:'a',n:'Sardina guisada con arroz',p:'pescado',t:['proteina','cereal'],e:['rapido'],min:20,i:[['sardina',78],['arroz',75],['tomate',40],['cebolla',20],['chiltoma',.25],['aceite',8]],
  s:['Cociná el arroz.','Sofreí cebolla, chiltoma y tomate.','Agregá la sardina con su salsa, 5 minutos.','Serví sobre el arroz.']},
 {id:'atun-arroz',m:'a',n:'Arroz con atún y vegetales',p:'pescado',t:['cereal','proteina'],e:[],min:25,i:[['atun',70],['arroz',80],['zanahoria',40],['chiltoma',.25],['cebolla',20],['aceite',8]],
  s:['Sofreí cebolla, chiltoma y zanahoria en cuadritos.','Agregá el arroz, dorá y echá el doble de agua con sal.','Cociná tapado 18 minutos.','Mezclá el atún escurrido y reposá 5 minutos.']},
 {id:'pasta-atun',m:'a',n:'Espaguetis con atún en tomate',p:'pescado',t:['cereal','proteina'],e:['pasta','rapido'],min:20,i:[['spaghetti',100],['atun',70],['tomate',80],['cebolla',20],['ajo',3],['aceite',10]],
  s:['Cociná la pasta.','Sofreí cebolla y ajo, agregá el tomate picado y cociná 6 minutos.','Sumá el atún escurrido.','Mezclá con la pasta.']},
 {id:'lentejas',m:'a',n:'Lentejas guisadas con arroz',p:'sincarne',t:['cereal','vegetal'],e:[],min:40,i:[['lenteja',70],['arroz',60],['zanahoria',40],['tomate',40],['cebolla',25],['ajo',3],['comino',.5]],
  s:['Cociná las lentejas en agua 25 minutos.','Sofreí cebolla, ajo, tomate y zanahoria con comino.','Agregá las lentejas con un poco de su caldo y sal; cociná 10 minutos.','Serví con arroz.']},
 {id:'garbanzos-chorizo',m:'a',n:'Garbanzos con chorizo y papa',p:'embutido',t:['proteina','cereal'],e:[],min:60,i:[['garbanzo',70],['chorizo',40],['papa',80],['tomate',40],['cebolla',20],['ajo',3]],
  s:['Remojá los garbanzos la noche anterior y cocinalos hasta que estén suaves.','Dorá el chorizo con cebolla y ajo.','Agregá tomate, papa y los garbanzos con caldo.','Cociná 20 minutos.']},
 {id:'salteado',m:'a',n:'Vegetales salteados con arroz y huevo',p:'huevo',t:['vegetal'],e:['ligero'],min:25,i:[['brocoli',100],['zanahoria',50],['zuquini',.35],['cebolla',25],['ajo',3],['huevo',1],['arroz',70],['aceite',10]],
  s:['Cociná el arroz.','Cortá brócoli, zanahoria, zuquini y cebolla.','Salteá a fuego alto con ajo 5 minutos.','Agregá el huevo batido y serví con el arroz.']},
 {id:'sopa-frijoles',m:'a',n:'Sopa de frijoles con huevo',p:'huevo',t:['cereal','proteina'],e:['sopa','tipico'],min:40,i:[['frijol',90],['huevo',1],['cebolla',20],['chiltoma',.25],['ajo',3],['tortilla',2],['queso_seco',25]],
  s:['Cociná los frijoles con sal, cebolla, chiltoma y ajo.','Agregá agua para hacer caldo y dejá hervir.','Quebrá los huevos en el caldo y cociná 4 minutos.','Serví con queso seco y tortilla.']},

 // CENAS
 {id:'pinto-maduro',m:'c',n:'Gallo pinto con maduro y queso',p:'sincarne',t:['cereal'],e:['tipico'],min:20,i:[['arroz',50],['frijol',40],['platano',1],['queso',50],['cebolla',10],['aceite',18]],
  s:['Prepará el gallo pinto.','Freí el maduro en tajadas.','Freí o asá el queso.','Serví todo junto.']},
 {id:'indio-viejo',m:'c',n:'Indio viejo',p:'res',t:['proteina','cereal'],e:['tipico'],min:60,i:[['res_posta',100],['harina_maiz',45],['tomate',60],['cebolla',35],['chiltoma',.25],['ajo',3],['naranja_agria',.5],['achiote',.5],['aceite',10]],
  s:['Cociná la carne con sal y ajo; deshilachala y guardá el caldo.','Disolvé la harina de maíz en el caldo tibio.','Sofreí cebolla, chiltoma y tomate con achiote; agregá la carne y el caldo con la masa.','Cociná revolviendo hasta que espese. Terminá con naranja agria.']},
 {id:'enchiladas',m:'c',n:'Enchiladas nicas',p:'res',t:['cereal','proteina'],e:['tipico'],min:35,i:[['tortilla',2],['carne_molida',50],['arroz',30],['harina_maiz',10],['repollo',50],['tomate',30],['vinagre',5],['aceite',25]],
  s:['Cociná la carne con arroz ya cocido, sal y tomate.','Rellená las tortillas, doblalas y sellalas con un poco de masa de harina de maíz.','Freílas hasta que estén crujientes.','Serví con repollo y tomate en vinagre.']},
 {id:'tacos-carne',m:'c',n:'Tacos de carne con repollo',p:'res',t:['proteina','vegetal'],e:['tipico'],min:25,i:[['tortilla',3],['carne_molida',70],['repollo',60],['tomate',40],['crema',20],['cebolla',15],['aceite',10]],
  s:['Cociná la carne con cebolla y sal hasta que esté seca.','Rellená, enrollá y dorá las tortillas.','Serví con repollo, tomate y crema.']},
 {id:'chayote-carne',m:'c',n:'Chayote guisado con carne molida',p:'res',t:['vegetal','proteina'],e:['ligero'],min:25,i:[['chayote',.6],['carne_molida',60],['tomate',40],['cebolla',20],['tortilla',2],['aceite',6]],
  s:['Dorá la carne con cebolla.','Agregá tomate y chayote en cuadritos con un poco de agua.','Tapá y cociná 12 minutos.','Serví con tortilla.']},
 {id:'vigoron',m:'c',n:'Vigorón casero',p:'cerdo',t:['proteina','vegetal'],e:['tipico'],min:40,i:[['yuca',200],['cerdo',110],['repollo',90],['tomate',40],['vinagre',10],['limon',.5],['aceite',20]],
  s:['Cociná la yuca en agua con sal hasta que esté suave.','Cociná el cerdo en poca agua con sal y dorálo hasta que esté crujiente.','Picá repollo y tomate con vinagre, limón y sal.','Serví la yuca con el cerdo y la ensalada encima.']},
 {id:'papas-chorizo',m:'c',n:'Papas con chorizo',p:'embutido',t:['proteina'],e:[],min:25,i:[['papa',160],['chorizo',45],['cebolla',20],['tortilla',2],['aceite',6]],
  s:['Cociná las papas en cuadritos 8 minutos.','Dorá el chorizo desmoronado con la cebolla.','Agregá las papas y dorá.','Serví con tortilla.']},
 {id:'arroz-frito',m:'c',n:'Arroz frito con salchicha',p:'embutido',t:['cereal','proteina'],e:['rapido'],min:20,i:[['arroz',70],['salchicha',60],['huevo',1],['zanahoria',30],['cebolla',20],['aceite',10]],
  s:['Usá arroz cocido, mejor del día anterior.','Dorá la salchicha con cebolla y zanahoria.','Agregá el arroz y salteá a fuego alto.','Revolvé el huevo a un lado y mezclá todo.']},
 {id:'macarrones',m:'c',n:'Macarrones con jamón y queso',p:'embutido',t:['cereal'],e:['pasta','rapido'],min:20,i:[['macarron',85],['jamon',40],['leche',60],['margarina',10],['queso',30]],
  s:['Cociná los macarrones y escurrilos.','Derretí la margarina, agregá la leche y el queso.','Sumá jamón picado y macarrones; revolvé hasta que esté cremoso.']},
 {id:'sandwich-jamon',m:'c',n:'Sándwich de jamón, queso y ensalada',p:'embutido',t:['cereal'],e:['rapido','ligero'],min:10,i:[['pan',2],['jamon',40],['queso',30],['tomate',30],['repollo',20],['mayonesa',10]],
  s:['Untá mayonesa al pan.','Armá con jamón, queso, tomate y repollo fino.','Tostalo en sartén si querés.']},
 {id:'huevos-frijol',m:'c',n:'Huevos con tomate y frijoles',p:'huevo',t:['proteina'],e:['rapido','tipico'],min:15,i:[['huevo',2],['tomate',50],['cebolla',15],['frijol',50],['tortilla',2],['aceite',8]],
  s:['Sofreí cebolla y tomate.','Agregá los huevos batidos y revolvé.','Calentá los frijoles y serví con tortilla.']},
 {id:'quesillo',m:'c',n:'Quesillo con tortilla',p:'sincarne',t:['cereal'],e:['tipico','rapido'],min:10,i:[['tortilla',2],['quesillo',70],['crema',25],['cebolla',15],['vinagre',5]],
  s:['Encurtí la cebolla en aros con vinagre y sal unos minutos.','Calentá la tortilla y poné el quesillo encima para que se ablande.','Enrollá y serví con crema y la cebolla.']},
 {id:'tostones',m:'c',n:'Tostones con queso frito',p:'sincarne',t:['cereal'],e:['tipico','rapido'],min:20,i:[['platano',1],['queso',60],['repollo',40],['aceite',25]],
  s:['Cortá el plátano verde en trozos gruesos y freílos 3 minutos.','Aplastalos y volvé a freírlos hasta que estén crujientes.','Freí el queso.','Serví con repollo picado.']},
 {id:'yuca-cuajada',m:'c',n:'Yuca con cuajada y crema',p:'sincarne',t:['cereal'],e:['tipico'],min:30,i:[['yuca',200],['cuajada',40],['crema',25],['repollo',50],['vinagre',5]],
  s:['Cociná la yuca en agua con sal hasta que esté suave.','Picá el repollo con vinagre y sal.','Serví con cuajada, crema y la ensalada.']},
 {id:'crema-papa',m:'c',n:'Crema de papa y zanahoria',p:'sincarne',t:['vegetal'],e:['sopa','ligero'],min:30,i:[['papa',160],['zanahoria',60],['leche',120],['margarina',10],['cebolla',20],['tortilla',2]],
  s:['Cociná papa, zanahoria y cebolla en agua con sal.','Licuá con un poco del agua y la leche.','Calentá con la margarina sin que hierva.','Serví con tortilla tostada.']},
 {id:'crema-ayote',m:'c',n:'Crema de ayote',p:'sincarne',t:['vegetal'],e:['sopa','ligero'],min:30,i:[['ayote',200],['papa',60],['leche',100],['margarina',8],['cebolla',20],['pan',1]],
  s:['Cociná el ayote pelado y la papa con cebolla.','Licuá con la leche.','Calentá con margarina y sal.','Serví con pan tostado.']},
 {id:'sopa-lentejas',m:'c',n:'Sopa de lentejas',p:'sincarne',t:['cereal','vegetal'],e:['sopa'],min:40,i:[['lenteja',60],['papa',60],['zanahoria',30],['tomate',30],['cebolla',20],['ajo',2],['tortilla',1]],
  s:['Sofreí cebolla, ajo y tomate.','Agregá las lentejas lavadas y agua abundante.','A los 20 minutos sumá papa y zanahoria.','Cociná hasta que todo esté suave.']},
 {id:'sopa-fideos',m:'c',n:'Sopa de fideos con pollo',p:'pollo',t:['vegetal','cereal'],e:['sopa','ligero'],min:30,i:[['pechuga',70],['fideo',40],['zanahoria',30],['papa',50],['cebolla',15],['consome',.5]],
  s:['Cociná la pechuga en agua con consomé y cebolla; deshilachala.','Agregá papa y zanahoria en cuadritos.','Sumá los fideos los últimos 5 minutos.','Regresá el pollo y serví.']},
 {id:'ensalada-pollo',m:'c',n:'Ensalada fresca de pollo',p:'pollo',t:['vegetal','proteina'],e:['ligero'],min:25,i:[['pechuga',100],['repollo',60],['tomate',50],['pepino',90],['limon',.5],['aguacate',.25]],
  s:['Cociná la pechuga y deshilachala.','Picá repollo, tomate y pepino.','Mezclá con limón y sal.','Agregá aguacate al servir.']},
 {id:'wrap-pollo',m:'c',n:'Wrap de pollo con ensalada',p:'pollo',t:['proteina','vegetal'],e:['rapido','ligero'],min:20,i:[['tortilla_harina',2],['pechuga',80],['repollo',40],['tomate',30],['mayonesa',10]],
  s:['Cociná la pechuga en tiras con sal y pimienta.','Calentá las tortillas.','Rellená con pollo, repollo, tomate y un poco de mayonesa; enrollá.']},
 {id:'salpicon-atun',m:'c',n:'Salpicón de atún con tortilla',p:'pescado',t:['proteina','vegetal'],e:['ligero','rapido'],min:10,i:[['atun',70],['tomate',50],['cebolla',20],['pepino',60],['limon',.5],['tortilla',2]],
  s:['Escurrí el atún.','Picá tomate, cebolla y pepino.','Mezclá con limón y sal.','Serví con tortillas tostadas.']},
 {id:'ensalada-coditos',m:'c',n:'Ensalada de coditos con atún',p:'pescado',t:['cereal'],e:['pasta','ligero'],min:20,i:[['coditos',70],['atun',50],['mayonesa',15],['zanahoria',30],['maiz_lata',30]],
  s:['Cociná los coditos y enfrialos.','Rallá la zanahoria.','Mezclá con atún, maíz, mayonesa y sal.']},
];

/* ================== LÓGICA ================== */
let PRICE_VERSION = 0;
const buyCache = new Map();
function setPrices(map){ // map: {id: precio}
  let changed = 0;
  for(const k in P) for(const o of P[k].o){ if(map[o.id] != null && +map[o.id] > 0 && +map[o.id] !== o.p){ o.p = +map[o.id]; changed++; } }
  if(changed){ PRICE_VERSION++; buyCache.clear(); }
  return changed;
}
function allOptions(){ const out=[]; for(const k in P) for(const o of P[k].o) out.push({key:k, ing:P[k], o}); return out; }

// Combinación más barata de empaques para cubrir una cantidad
function buy(key, need){
  if(need <= 1e-9) return {cost:0, picks:[], qty:0};
  const ck = key+'|'+Math.round(need*100);
  const hit = buyCache.get(ck); if(hit) return hit;
  const ops = P[key].o;
  const single = (o, n) => {
    if(n <= 1e-9) return {cost:0, picks:[], qty:0};
    if(o.b){ const st = o.st || 56.75; const q = Math.ceil(n/st - 1e-9)*st; return {cost:q/o.s*o.p, picks:[{o, c:q/o.s}], qty:q}; }
    const c = Math.ceil(n/o.s - 1e-9); return {cost:c*o.p, picks:[{o,c}], qty:c*o.s};
  };
  let best = null;
  for(const big of ops){
    if(big.b) continue;
    const max = Math.ceil(need/big.s - 1e-9);
    for(let k=0;k<=max;k++){
      const rest = need - k*big.s;
      for(const o of ops){
        if(o===big && k>0) continue;
        const r = single(o, rest);
        const cost = k*big.p + r.cost;
        if(!best || cost < best.cost - 1e-9) best = {cost, picks:(k?[{o:big,c:k}]:[]).concat(r.picks), qty:k*big.s + r.qty};
      }
    }
  }
  for(const o of ops){ const r = single(o, need); if(!best || r.cost < best.cost - 1e-9) best = r; }
  const m = new Map(); for(const p of best.picks) m.set(p.o, (m.get(p.o)||0) + p.c);
  best.picks = [...m].map(([o,c])=>({o,c}));
  buyCache.set(ck, best);
  return best;
}
function totalCost(needs, skip){ let t=0; for(const k in needs){ if(skip && skip.has(k)) continue; t += buy(k, needs[k]).cost; } return t; }
function addNeeds(needs, recipe, people, sign=1){
  const n = Object.assign({}, needs);
  for(const [k,a] of recipe.i){ n[k] = (n[k]||0) + sign*a*people; if(n[k] < 1e-9) delete n[k]; }
  n.sal = (n.sal||0) + sign*2*people; if(n.sal < 1e-9) delete n.sal;
  return n;
}
function unitPrice(key){ return Math.min(...P[key].o.map(o=>o.p/o.s)); }
function recipeCost(r, people, skip){ return r.i.reduce((s,[k,a])=> s + (skip && skip.has(k) ? 0 : unitPrice(k)*a*people), 0); }
const isQuick = r => r.min <= 20;
function styleHit(r, styles){ let n=0; for(const s of styles){ if(s==='rapido' ? isQuick(r) : r.e.includes(s)) n++; } return n; }
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed>>>15, 1 | seed); t = t + Math.imul(t ^ t>>>7, 61 | t) ^ t; return ((t ^ t>>>14)>>>0)/4294967296; }; }

function pool(m, allow){ const all = R.filter(r=>r.m===m); const f = all.filter(r=>allow.has(r.p)); return {list: f.length ? f : all, fallback: !f.length}; }

/* opts: {budget, days:[{i,name}], meals:['d','a','c'], people, pref, allow:Set, styles:Set, locks:{}, seed, skip:Set} */
function planMenu(opts){
  const {budget, days, meals, people, pref, allow, styles, locks={}, seed=1, skip} = opts;
  const pools = {}; const fallbacks = [];
  for(const m of meals){ pools[m] = pool(m, allow); if(pools[m].fallback) fallbacks.push(m); }
  const maxUses = m => Math.max(2, Math.ceil(days.length/3), Math.ceil(days.length/pools[m].list.length)+1);
  const hit = r => pref!=='equilibrado' && r.t.includes(pref);
  const lockOf = (di, m) => { const id = locks[days[di].i+m]; return id ? R.find(r=>r.id===id) : null; };
  const build = (costW) => {
    const rand = rng(seed);
    let needs = {}; const uses = {}; const plan = [];
    // primero cuenta los bloqueados
    days.forEach((d,di)=> meals.forEach(m => { const L = lockOf(di,m); if(L){ uses[L.id]=(uses[L.id]||0)+1; needs = addNeeds(needs, L, people); } }));
    days.forEach((day, di) => {
      const row = {day:day.name, di:day.i, meals:{}};
      for(const m of meals){
        const L = lockOf(di,m);
        if(L){ row.meals[m] = L; continue; }
        const prev = di>0 ? plan[di-1].meals[m]?.id : null;
        let best=null, bestS=Infinity;
        const base = totalCost(needs, skip);
        for(const r of pools[m].list){
          if(r.id === prev && pools[m].list.length>1) continue;
          const u = uses[r.id]||0;
          if(u >= maxUses(m)) continue;
          const marg = totalCost(addNeeds(needs, r, people), skip) - base;
          const s = marg*costW - (hit(r) ? 30*people : 0) - styleHit(r, styles)*22*people + u*30*people + rand()*16*people;
          if(s < bestS){ bestS=s; best=r; }
        }
        if(!best) best = pools[m].list[Math.floor(rand()*pools[m].list.length)];
        row.meals[m] = best; uses[best.id]=(uses[best.id]||0)+1; needs = addNeeds(needs, best, people);
      }
      plan.push(row);
    });
    return {plan, needs, total: totalCost(needs, skip)};
  };
  let res = null;
  for(const w of [0.3, 0.6, 1, 1.6, 2.5, 4]){
    const cand = build(w);
    if(!res || cand.total < res.total) res = cand;
    if(cand.total <= budget){ res = cand; break; }
  }
  const needsOf = plan => plan.reduce((n,row)=>meals.reduce((nn,m)=>addNeeds(nn,row.meals[m],people), n), {});
  let total = res.total, guard = 0;
  while(total > budget && guard++ < 300){
    const cu = {}; res.plan.forEach(row=>meals.forEach(m=>{ const id=row.meals[m].id; cu[id]=(cu[id]||0)+1; }));
    let bestGain=0, bestSwap=null;
    res.plan.forEach((row, pi) => {
      for(const m of meals){
        if(lockOf(pi,m)) continue;
        const cur = row.meals[m];
        for(const r of pools[m].list){
          if(r.id===cur.id || (cu[r.id]||0) >= maxUses(m)) continue;
          if(pi>0 && res.plan[pi-1].meals[m].id===r.id) continue;
          if(pi<res.plan.length-1 && res.plan[pi+1].meals[m].id===r.id) continue;
          const t = totalCost(addNeeds(addNeeds(res.needs, cur, people, -1), r, people), skip);
          const gain = total - t - (hit(cur) && !hit(r) ? 8*people : 0);
          if(gain > bestGain + 1e-6){ bestGain = gain; bestSwap = {pi, m, r}; }
        }
      }
    });
    if(!bestSwap) break;
    res.plan[bestSwap.pi].meals[bestSwap.m] = bestSwap.r;
    res.needs = needsOf(res.plan); total = totalCost(res.needs, skip);
  }
  return {plan:res.plan, needs:res.needs, total, budget, people, pref, meals, fallbacks};
}
function recompute(result, skip){ // tras cambiar un platillo a mano
  const {plan, meals, people} = result;
  result.needs = plan.reduce((n,row)=>meals.reduce((nn,m)=>addNeeds(nn,row.meals[m],people), n), {});
  result.total = totalCost(result.needs, skip);
  return result;
}
function shoppingList(needs, plan, meals, skip){
  const usedIn = {};
  plan.forEach(row => meals.forEach(m => row.meals[m].i.forEach(([k]) => { (usedIn[k] = usedIn[k]||new Set()).add(row.di+m); })));
  return Object.keys(needs).map(k => { const b = buy(k, needs[k]); return {key:k, ...P[k], need:needs[k], ...b, left:b.qty-needs[k], uses:usedIn[k]?usedIn[k].size:(k==='sal'?plan.length:0), pantry:!!(skip && skip.has(k))}; })
    .sort((a,b)=> (a.pantry-b.pantry) || 'cglv'.indexOf(a.c) - 'cglv'.indexOf(b.c) || b.cost - a.cost);
}
if(typeof module !== 'undefined' && module.exports) module.exports = {P,R,PANTRY,buy,planMenu,shoppingList,totalCost,setPrices,recompute,allOptions};
