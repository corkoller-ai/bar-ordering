import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
);

const PASSWORD = "DaleeeOrders";
const SUP = {
  Premier:{dl:"Before Noon Wed",del:"Thursday",ct:"Aaron Montoya",ph:"505-614-5656",url:"https://mybeesapp.com/customer/account",win:"Mon–Wed"},
  Admiral:{dl:"Before 3pm Wed",del:"Friday",ct:"Michael Martinez",ph:"(575) 770-6592",url:"https://apps.vtinfo.com/retailer-portal/00785/retailer/S1774",win:"Mon–Wed"},
  Southern:{dl:"Before 3pm Tue",del:"Thursday",ct:"Sydnie",ph:"(505) 458-1627",url:"https://shop.sgproof.com",win:"Mon–Tue"},
  RNDC:{dl:"Before 3pm (biweekly)",del:"Thursday",ct:"Jim",ph:"(575) 779-4745",url:"https://app.erndc.com/login",win:"Mon/Tue biweekly"},
  Fiasco:{dl:"Before 3pm Tue",del:"Thursday",ct:"NOVA",ph:"575-7794440",url:"",win:"Mon–Tue"},
  "Rolling Still":{dl:"Coordinate w/ Dan",del:"Coordinate",ct:"Dan",ph:"575-779-7977",url:"",win:"As needed"},
  "Bow & Arrow":{dl:"Contact Peter Moore",del:"Every 2 weeks",ct:"Peter Moore",ph:"",url:"",win:"Biweekly"},
  Pepsi:{dl:"Before 2pm Tue",del:"Tuesday",ct:"Kevin",ph:"505-595-5858",url:"https://www.pepsicopartners.com/",win:"Before Tue"},
  Shamrock:{dl:"Before 5pm Mon",del:"Tuesday",ct:"",ph:"",url:"https://shamrockorders.com/Catalog?svn=05",win:"Monday"},
  Webstaurante:{dl:"None",del:"Varies",ct:"",ph:"",url:"webstaurantstore.com",win:"As needed"},
  "Mathenson CO2":{dl:"Check timing",del:"Mon or Tue",ct:"",ph:"505-982-1997",url:"",win:"As needed"},
};

const mk=(id,cat,sup,name,size,unit,bP,sP,rule,note,cost,oz)=>({id,cat,supplier:sup,name,size,unit:unit||"btl",barPar:bP,barStock:bP,storPar:sP,storStock:sP,rule:rule||"standard",ruleNote:note||"",cost:cost||0,ozPerBottle:oz||0,notes:""});

const INIT=[
  mk(1,"Beer","Premier","Michelob Ultra","24pk","case",19,3,"standard","",24.60,0),
  mk(2,"Beer","Premier","Bud Light","24pk","case",19,3,"standard","",19.80,0),
  mk(3,"Beer","Premier","Budweiser","18pk","case",29,3,"standard","",16.30,0),
  mk(4,"Beer","Admiral","Coors Light","2/12pk","case",12,3,"standard","",22.30,0),
  mk(5,"Beer","Admiral","PBR","30pk","case",50,3,"standard","",23.74,0),
  mk(6,"Beer","Premier","Stella Artois","24pk","case",24,3,"standard","",28.00,0),
  mk(7,"Beer","Admiral","Corona","24pk","case",37,4,"standard","",29.78,0),
  mk(8,"Beer","Admiral","Modelo Especial","24pk","case",54,10,"standard","",29.78,0),
  mk(9,"Beer","Admiral","Modelo Negra","4/6pk","case",20,3,"standard","",32.30,0),
  mk(10,"Beer","Admiral","Guinness","2/12pk","case",12,3,"standard","",31.00,0),
  mk(11,"Beer","Admiral","Tecate","30pk","case",32,3,"standard","",28.75,0),
  mk(12,"Beer","Admiral","Dos Equis","24pk","case",36,8,"standard","",26.80,0),
  mk(13,"Beer","Premier","Ex Novo Mass Ascension","6x4pk","case",12,4,"standard","",49.50,0),
  mk(14,"Beer","Premier","Eastciders Original","4/6pk","case",19,1,"standard","",31.50,0),
  mk(15,"Beer","Premier","Eastciders Blood Orange","4/6pk","case",24,2,"standard","",31.50,0),
  mk(16,"Beer","Admiral","Angry Orchard","4/6pk","case",7,1,"standard","",32.50,0),
  mk(17,"Beer","Admiral","Athletic Upside Dawn","2/12pk","case",18,1,"standard","",32.00,0),
  mk(18,"Beer","Admiral","Athletic IPA","2/12pk","case",18,1,"standard","",32.00,0),
  mk(19,"Soda/NA","Premier","Zia Vida Root Beer","12pk","case",7,1,"standard","",16.80,0),
  mk(20,"Soda/NA","Premier","Zia Vida Sandia","12pk","case",7,1,"standard","",16.80,0),
  mk(21,"Soda/NA","Admiral","Red Bull","6/4pk","case",20,1,"standard","",42.15,0),
  mk(22,"Soda/NA","Admiral","Jarritos/Mineragua","12pk","case",6,1,"standard","",10.24,0),
  mk(23,"Soda/NA","Southern","Goslings Ginger Beer","4/6pk","case",10,2,"standard","",7.00,12),
  mk(24,"Wine","Fiasco","Malbec","750ml","btl",3,1,"below_threshold","Reorder if storage < 0.5",11.00,25.4),
  mk(25,"Wine","Fiasco","Pinot Noir","750ml","btl",3,1,"below_threshold","Reorder if storage < 0.5",10.99,25.4),
  mk(26,"Wine","Fiasco","Chardonnay","750ml","btl",6,1,"below_threshold","Reorder if storage < 0.5",10.00,25.4),
  mk(27,"Wine","Fiasco","Sauvignon Blanc","750ml","btl",6,1,"below_threshold","Reorder if storage < 0.5",9.99,25.4),
  mk(28,"Wine","Fiasco","Prosecco","750ml","btl",4,1,"below_threshold","Reorder if storage < 0.5",13.00,25.4),
  mk(29,"Wine","Fiasco","Vinho Verde","750ml","btl",6,1,"below_threshold","Reorder if storage < 0.5",7.87,25.4),
  mk(30,"Tequila","Southern","Mi Campo Blanco","1L","btl",4,12,"always_full","ALWAYS need 2 full cases (12btl)",14.39,33.8),
  mk(31,"Tequila","Southern","Mi Campo Reposado","1L","btl",2,6,"standard","",0,33.8),
  mk(32,"Tequila","Southern","Espolon Blanco","1L","btl",2,6,"standard","",24.99,33.8),
  mk(33,"Tequila","Southern","Hornitos Plata","1L","btl",2,6,"standard","",32.59,33.8),
  mk(34,"Tequila","Southern","Hornitos Reposado","1L","btl",2,6,"standard","Often free w/ Plata deal",0,33.8),
  mk(35,"Tequila","Southern","Patron Silver","750ml","btl",2,6,"standard","",44.59,25.4),
  mk(36,"Tequila","Southern","Don Julio Blanco","1L","btl",2,6,"standard","",48.59,33.8),
  mk(37,"Tequila","Southern","De Leon Blanco","750ml","btl",2,0,"standard","",0,25.4),
  mk(38,"Tequila","Southern","Teremana Blanco","1L","btl",1,0,"standard","",32.59,33.8),
  mk(39,"Tequila","Southern","Casa Noble Repo","750ml","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,25.4),
  mk(40,"Tequila","Southern","Casa Noble Anejo","750ml","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,25.4),
  mk(41,"Tequila","Southern","Sauza Hacienda Gold","1L","btl",1,0,"discontinue","Let it run out",0,33.8),
  mk(42,"Vodka","Southern","Tito's","1L","btl",2,12,"standard","~$27.44 eff (buy 3 get 1)",27.44,33.8),
  mk(43,"Vodka","Southern","Grey Goose","1L","btl",2,0,"standard","",43.59,33.8),
  mk(44,"Vodka","Rolling Still","Green Chile Vodka","750ml","btl",2,6,"standard","",0,25.4),
  mk(45,"Vodka","Rolling Still","Red Chile Vodka","750ml","btl",2,6,"standard","",0,25.4),
  mk(46,"Vodka","Rolling Still","Pecan Vodka","750ml","btl",2,0,"standard","",0,25.4),
  mk(47,"Vodka","Rolling Still","Lavender Vodka","750ml","btl",2,0,"standard","",0,25.4),
  mk(48,"Vodka","Rolling Still","Regular Vodka","750ml","btl",2,0,"standard","",0,25.4),
  mk(49,"Vodka","RNDC","New Amsterdam Vodka","1L","btl",4,12,"standard","",10.99,33.8),
  mk(50,"Vodka","RNDC","Ketel One","1L","btl",2,6,"standard","",33.99,33.8),
  mk(51,"Whiskey","Southern","Chivas Regal 12yr","1L","btl",2,0,"standard","",39.00,33.8),
  mk(52,"Whiskey","Southern","Maker's Mark","1L","btl",2,6,"standard","~$31.67 eff (buy 4 get 1)",31.67,33.8),
  mk(53,"Whiskey","Southern","Bulleit Rye","1L","btl",2,6,"standard","~$18.80 eff (buy 1 get 1)",18.80,33.8),
  mk(54,"Whiskey","Southern","Crown Royal","750ml","btl",2,6,"standard","",31.09,25.4),
  mk(55,"Whiskey","Southern","Crown Royal Peach","750ml","btl",2,6,"standard","",30.99,25.4),
  mk(56,"Whiskey","Southern","Wild Turkey 101","1L","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",31.59,33.8),
  mk(57,"Whiskey","Southern","Angel's Envy","750ml","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",43.59,25.4),
  mk(58,"Whiskey","Southern","Jim Beam","1L","btl",2,12,"standard","",22.19,33.8),
  mk(59,"Whiskey","RNDC","Jameson","1L","btl",2,6,"standard","",36.54,33.8),
  mk(60,"Whiskey","RNDC","Evan Williams","1L","btl",4,12,"standard","",11.50,33.8),
  mk(61,"Whiskey","RNDC","Jack Daniel's","1L","btl",2,12,"standard","",30.18,33.8),
  mk(62,"Whiskey","RNDC","Fireball","1L","btl",1,6,"standard","",17.97,33.8),
  mk(63,"Whiskey","Rolling Still","Ponderosa Whiskey","750ml","btl",2,6,"standard","",0,25.4),
  mk(64,"Gin","Southern","Bombay Sapphire","1L","btl",2,6,"standard","",39.59,33.8),
  mk(65,"Gin","RNDC","New Amsterdam Gin","1L","btl",4,12,"standard","",11.99,33.8),
  mk(66,"Gin","RNDC","Empress Rose Gin","1L","btl",2,0,"standard","",44.79,33.8),
  mk(67,"Gin","RNDC","Tanqueray","1L","btl",2,6,"standard","~$26.54 eff (buy 6 get 2)",26.54,33.8),
  mk(68,"Gin","RNDC","Hendricks","1L","btl",2,6,"standard","",39.95,33.8),
  mk(69,"Rum","Southern","Captain Morgan","1L","btl",2,0,"quarter_rule","Don't reorder until bar ≤ 0.25. OOS til ~4/20",26.99,33.8),
  mk(70,"Rum","Southern","Myers Dark Rum","1L","btl",2,0,"standard","",31.99,33.8),
  mk(71,"Rum","Southern","Bacardi Light","1L","btl",2,0,"standard","",27.59,33.8),
  mk(72,"Rum","RNDC","Barton Light Rum","1L","btl",4,12,"standard","",8.11,33.8),
  mk(73,"Mezcal","RNDC","Mezcal 400 Conejos","750ml","btl",2,6,"standard","",23.00,25.4),
  mk(145,"Mezcal","RNDC","Mezcal 400 Conejos 1.75L","1.75L","btl",1,2,"standard","",0,59.2),
  mk(74,"Liqueurs","Southern","Jagermeister","1L","btl",2,0,"standard","",33.59,33.8),
  mk(75,"Liqueurs","Southern","Triple Sec","1L","btl",4,12,"standard","~$10.07 eff (buy 4 get 1)",10.07,33.8),
  mk(76,"Liqueurs","Southern","Grand Marnier","1L","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,33.8),
  mk(77,"Liqueurs","Southern","Kahlua","1L","btl",1,6,"standard","",29.00,33.8),
  mk(78,"Liqueurs","Southern","M&R Vermouth Rosso","1L","btl",1,6,"standard","",13.00,33.8),
  mk(79,"Liqueurs","Southern","M&R Vermouth Dry","1L","btl",1,6,"standard","",13.00,33.8),
  mk(80,"Liqueurs","Southern","Aperol","1L","btl",1,6,"standard","",31.00,33.8),
  mk(81,"Liqueurs","Southern","Campari","1L","btl",1,6,"standard","",45.99,33.8),
  mk(82,"Liqueurs","Southern","St. Germain","750ml","btl",1,0,"standard","",34.59,25.4),
  mk(83,"Liqueurs","Southern","Luxardo Maraschino","750ml","btl",1,0,"standard","",32.00,25.4),
  mk(84,"Liqueurs","Southern","Blackberry Brandy","1L","btl",1,0,"discontinue","Let it run out",0,33.8),
  mk(85,"Liqueurs","Southern","Watermelon Schnapps","1L","btl",1,0,"standard","Free w/promo",0,33.8),
  mk(86,"Liqueurs","Southern","Blue Curacao","1L","btl",1,0,"standard","Free w/deals",0,33.8),
  mk(87,"Liqueurs","RNDC","Fernet Branca","750ml","btl",2,6,"standard","",31.30,25.4),
  mk(88,"Liqueurs","RNDC","Baileys","1L","btl",1,6,"standard","",36.24,33.8),
  mk(89,"Liqueurs","RNDC","Mr. Boston Amaretto","1L","btl",1,12,"standard","",8.90,33.8),
  mk(90,"Liqueurs","RNDC","Chambord","700ml","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",31.55,23.7),
  mk(91,"Liqueurs","RNDC","Rumple Minze","1L","btl",1,0,"standard","",32.24,33.8),
  mk(92,"Liqueurs","RNDC","Southern Comfort","btl","btl",0,0,"discontinue","Let it run out",0,25.4),
  mk(93,"Liqueurs","RNDC","Peach Schnapps","750ml","btl",1,6,"standard","",4.39,25.4),
  mk(94,"Liqueurs","RNDC","Mr. Boston Peppermint","1L","btl",1,6,"standard","",8.90,33.8),
  mk(95,"Liqueurs","RNDC","Naranja Orange","1L","btl",1,6,"standard","",22.04,33.8),
  mk(96,"Mixers","RNDC","Santa Fe Margarita Mix","1L","btl",4,12,"standard","",4.89,33.8),
  mk(97,"Mixers","RNDC","Bloody Mary Mix","1L","btl",1,6,"below_quarter","Reorder if storage ≤ 0.25",4.42,33.8),
  mk(98,"Mixers","RNDC","Finest Call Grenadine","1L","btl",2,6,"below_quarter","Reorder if storage ≤ 0.25",4.50,33.8),
  mk(99,"Mixers","RNDC","Finest Call Lime Juice","1L","btl",2,12,"below_half","Reorder if storage ≤ 0.5",6.00,33.8),
  mk(100,"Mixers","RNDC","Finest Call Lemon Juice","1L","btl",2,6,"discontinue","Let it run out",6.30,33.8),
  mk(101,"Mixers","RNDC","Finest Call Strawberry","1L","btl",1,12,"standard","",4.50,33.8),
  mk(102,"Mixers","RNDC","Clamato Juice","1L","btl",1,6,"below_quarter","Reorder if storage ≤ 0.25",4.42,33.8),
  mk(103,"Seltzers","RNDC","High Noon Tequila Lime","355ml 24pk","case",13,1,"below_half","Reorder if storage ≤ 0.5",45.60,0),
  mk(104,"Seltzers","RNDC","High Noon Pineapple","355ml 24pk","case",18,1,"below_half","Reorder if storage ≤ 0.5",45.60,0),
  mk(105,"Kegs","Premier","La Cumbre Elevated IPA 1/2","1/2 Keg","keg",3,0,"flexible","Par 2-3 (+$50 dep)",160.00,1984),
  mk(106,"Kegs","Premier","La Cumbre Elevated IPA 1/6","1/6 Keg","keg",2,0,"flexible","Par 1-2 (+$50 dep)",66.00,661),
  mk(107,"Kegs","Premier","Other La Cumbre","Various","keg",0,0,"flexible","Weekly deals"),
  mk(108,"Kegs","Premier","Tractor Brewery","Various","keg",0,0,"flexible","Weekly variety"),
  mk(109,"Kegs","Admiral","Marble Cerveza 1/2","1/2 Keg","keg",2,0,"standard","(+$30 dep)",160.00,1984),
  mk(110,"Kegs","Admiral","Other Marble","Various","keg",0,0,"flexible","Weekly deals"),
  mk(111,"Kegs","Bow & Arrow","B&A Variety","Various","keg",0,0,"flexible","1/6: $65-125, 1/2: $170-195 (+$30 dep)"),
  mk(112,"Kegs","RNDC","Fat Tire","1/2 or 1/6","keg",1,0,"standard","1/2:$155 1/6:$72",155.00,1984),
  mk(113,"Fountain","Pepsi","Pepsi","BIB","BIB",1,1,"reorder_empty","Reorder when 0"),
  mk(114,"Fountain","Pepsi","Diet Pepsi","BIB","BIB",1,1,"reorder_empty","Reorder when 0"),
  mk(115,"Fountain","Pepsi","Sierra Mist/Starry","BIB","BIB",1,1,"reorder_empty","Reorder when 0"),
  mk(116,"Fountain","Pepsi","Dr. Pepper","BIB","BIB",1,1,"reorder_empty","Reorder when 0"),
  mk(117,"Fountain","Pepsi","Tonic","BIB","BIB",1,1,"reorder_empty","Reorder when 0"),
  mk(118,"Fountain","Pepsi","Lemonade","BIB","BIB",1,1,"reorder_empty","Reorder when 0"),
  mk(119,"CO2","Mathenson CO2","CO2 Tank","50lb","tank",1,2,"below_stor_par","~$37/tank + fees",37.31,0),
  mk(120,"Supplies","Webstaurante","9oz Plastic Cups","Cases","case",0,1,"below_half",""),
  mk(121,"Supplies","Webstaurante","16oz Plastic Cups","Cases","case",0,1,"below_half",""),
  mk(122,"Supplies","Webstaurante","Water Cups","Cases","case",0,1,"below_half",""),
  mk(123,"Supplies","Webstaurante","Jumbo Straws","Boxes","box",0,2,"standard",""),
  mk(124,"Supplies","Webstaurante","Stir Stick Straws","Cases","case",0,1,"standard",""),
  mk(125,"Supplies","Webstaurante","Plastic Forks","Boxes","box",0,1,"below_half",""),
  mk(126,"Supplies","Webstaurante","Plastic Knives","Boxes","box",0,1,"below_half",""),
  mk(127,"Supplies","Webstaurante","Plastic Spoons","Boxes","box",0,1,"below_half",""),
  mk(128,"Supplies","Webstaurante","Napkins (Dispenser)","Boxes","box",0,1,"below_quarter",""),
  mk(129,"Supplies","Webstaurante","Napkins (Beverage)","Boxes","box",0,1,"below_quarter",""),
  mk(130,"Supplies","Webstaurante","Large To-Go Boxes","Boxes","box",0,1,"below_quarter",""),
  mk(131,"Supplies","Webstaurante","Small To-Go Boxes","Boxes","box",0,1,"below_quarter",""),
  mk(132,"Supplies","Webstaurante","To-Go Ramekins","Cases","case",0,1,"below_quarter",""),
  mk(133,"Supplies","Webstaurante","To-Go Ramekin Lids","Cases","case",0,1,"below_quarter",""),
  mk(134,"Supplies","Webstaurante","To-Go Bags","Cases","case",0,1,"below_quarter",""),
  mk(135,"Supplies","Webstaurante","Grapefruit Juice","Cases","case",0,1,"below_quarter",""),
  mk(136,"Supplies","Webstaurante","Cranberry Juice","Cases","case",0,1,"below_quarter",""),
  mk(137,"Supplies","Webstaurante","Pineapple Juice","Cases","case",0,1,"below_quarter",""),
  mk(138,"Supplies","Webstaurante","Coconut Puree","Cases","case",0,1,"below_quarter",""),
  mk(139,"Food","Shamrock","Prickly Pear Syrup","—","ea",0,0,"chef_order","Tell chef Sunday"),
  mk(140,"Food","Shamrock","Mint","—","ea",0,0,"chef_order","Tell chef Sunday"),
  mk(141,"Food","Shamrock","Watermelon","—","ea",0,0,"chef_order","Tell chef Sunday"),
  mk(142,"Bar Essentials","TBD","Angostura Bitters","btl","btl",2,1,"below_quarter",""),
  mk(143,"Bar Essentials","TBD","Luxardo Cherries","jar","jar",1,2,"standard",""),
  mk(144,"Bar Essentials","TBD","Tajin","case","case",1,1,"below_quarter",""),
];

function getStatus(p){
  if(p.rule==="discontinue")return{level:"skip",label:"Discontinuing"};
  if(p.rule==="chef_order")return{level:"info",label:"Food order"};
  if(p.rule==="flexible")return{level:"info",label:"Flexible"};
  if(p.rule==="quarter_rule"){
    if(p.storPar>0)return p.storStock<p.storPar?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
    return p.barStock<=0.25?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  }
  if(p.rule==="below_threshold")return p.storStock<0.5?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if(p.rule==="below_quarter")return p.storStock<=0.25?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if(p.rule==="below_half")return p.storStock<=0.5?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if(p.rule==="always_full")return p.storStock<p.storPar?{level:"urgent",label:"URGENT"}:{level:"ok",label:"OK"};
  if(p.rule==="reorder_empty")return p.storStock<=0?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if(p.rule==="below_stor_par")return p.storStock<p.storPar?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if(p.storPar===0&&p.barPar===0)return{level:"ok",label:"OK"};
  if(p.storPar===0){
    if(p.barStock===0)return{level:"urgent",label:"OUT"};
    if(p.barStock<p.barPar*0.5)return{level:"low",label:"LOW"};
    return{level:"ok",label:"OK"};
  }
  const short=Math.max(0,p.barPar-p.barStock);
  if(p.storStock===0&&p.barStock===0)return{level:"urgent",label:"OUT"};
  if(p.storStock===0&&short>0)return{level:"urgent",label:"URGENT"};
  if(p.storStock<p.storPar*0.3)return{level:"urgent",label:"URGENT"};
  if(p.storStock<p.storPar)return{level:"low",label:"ORDER"};
  if((p.storStock-short)<p.storPar)return{level:"low",label:"ORDER"};
  return{level:"ok",label:"OK"};
}

const SC={urgent:{bg:"#FFE0E0",tx:"#991B1B",bd:"#F09595"},low:{bg:"#FFF3CD",tx:"#854F0B",bd:"#FAC775"},watch:{bg:"#FFF8DC",tx:"#633806",bd:"#EF9F27"},ok:{bg:"#D4EDDA",tx:"#085041",bd:"#5DCAA5"},skip:{bg:"#F1EFE8",tx:"#5F5E5A",bd:"#B4B2A9"},info:{bg:"#E6F1FB",tx:"#0C447C",bd:"#85B7EB"}};
const CATS=[...new Set(INIT.map(p=>p.cat))];
const R=n=>Math.round(n*100)/100;
const weekId=()=>{const d=new Date();d.setDate(d.getDate()-d.getDay()+1);return d.toISOString().slice(0,10);};

async function dbLoad(){try{const{data,error}=await supabase.from("app_state").select("data").eq("id","main").single();if(error)throw error;return data?.data||{};}catch(e){console.error(e);return{};}}
async function dbSave(s){try{await supabase.from("app_state").upsert({id:"main",data:s,updated_at:new Date().toISOString()});}catch(e){console.error(e);}}

// Searchable dropdown component
function SearchSelect({items,value,onChange,placeholder}){
  const[open,setOpen]=useState(false);const[q,setQ]=useState("");const ref=useRef();
  const sel=items.find(i=>String(i.id)===String(value));
  const fil=q?items.filter(i=>i.label.toLowerCase().includes(q.toLowerCase())):items;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  return(<div ref={ref} style={{position:"relative",width:"100%"}}>
    <input value={open?q:(sel?.label||"")} onChange={e=>{setQ(e.target.value);if(!open)setOpen(true);}} onFocus={()=>{setOpen(true);setQ("");}} placeholder={placeholder||"Search..."} style={{width:"100%",padding:"8px",borderRadius:6,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
    {open&&<div style={{position:"absolute",top:"100%",left:0,right:0,maxHeight:200,overflow:"auto",background:"#fff",border:"1px solid #ccc",borderRadius:6,zIndex:20,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
      {fil.slice(0,30).map(i=><div key={i.id} onClick={()=>{onChange(String(i.id));setOpen(false);setQ("");}} style={{padding:"8px 10px",fontSize:12,cursor:"pointer",borderBottom:"1px solid #f0f0f0",background:String(i.id)===String(value)?"#e8f0fe":"#fff"}} onMouseOver={e=>e.target.style.background="#f5f5f5"} onMouseOut={e=>e.target.style.background=String(i.id)===String(value)?"#e8f0fe":"#fff"}>{i.label}</div>)}
      {fil.length===0&&<div style={{padding:10,fontSize:12,color:"#888"}}>No results</div>}
    </div>}
  </div>);
}

export default function App(){
  const[auth,setAuth]=useState(false);const[pw,setPw]=useState("");const[pwErr,setPwErr]=useState(false);
  const[dark,setDark]=useState(false);
  const[products,setProducts]=useState(INIT);
  const[snapshots,setSnapshots]=useState([]);const[orderLog,setOrderLog]=useState([]);const[recipes,setRecipes]=useState([]);
  const[pourCostLog,setPourCostLog]=useState([]);const[varianceLog,setVarianceLog]=useState([]);const[posLog,setPosLog]=useState([]);
  const[view,setView]=useState("dashboard");const[filter,setFilter]=useState("all");const[supFilter,setSupFilter]=useState("all");
  const[catFilter,setCatFilter]=useState("all");const[search,setSearch]=useState("");
  const[editId,setEditId]=useState(null);const[ef,setEf]=useState({});
  const[loaded,setLoaded]=useState(false);const[saving,setSaving]=useState(false);
  const[orderSup,setOrderSup]=useState("");const[orderItems,setOrderItems]=useState("");const[orderNote,setOrderNote]=useState("");
  const[rName,setRName]=useState("");const[rIng,setRIng]=useState([{pid:"",oz:""}]);const[rPrice,setRPrice]=useState("");const[rEditId,setREditId]=useState(null);
  const[pcB,setPcB]=useState("");const[pcP,setPcP]=useState("");const[pcE,setPcE]=useState("");const[pcS,setPcS]=useState("");
  const[dpC,setDpC]=useState("");const[dpB,setDpB]=useState("33.8");const[dpP,setDpP]=useState("1.5");const[dpT,setDpT]=useState("20");
  const[vProd,setVProd]=useState("");const[vExp,setVExp]=useState("");const[vAct,setVAct]=useState("");const[vN,setVN]=useState("");
  const[finTab,setFinTab]=useState("pour");
  const[posProd,setPosProd]=useState("");const[posPours,setPosPours]=useState("");const[posPourSz,setPosPourSz]=useState("1.5");
  const[snapView,setSnapView]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[np,setNp]=useState({name:"",cat:"Tequila",supplier:"Southern",size:"1L",unit:"btl",barPar:2,storPar:6,cost:0,oz:33.8,rule:"standard",ruleNote:""});
  const[genOrderSup,setGenOrderSup]=useState("");
  // invoice price update
  const[ipProd,setIpProd]=useState("");const[ipCost,setIpCost]=useState("");const[ipNote,setIpNote]=useState("");

  const load=useCallback(async()=>{
    const d=await dbLoad();
    if(d.products)setProducts(d.products);if(d.snapshots)setSnapshots(d.snapshots);if(d.orderLog)setOrderLog(d.orderLog);
    if(d.recipes)setRecipes(d.recipes);if(d.pourCostLog)setPourCostLog(d.pourCostLog);if(d.varianceLog)setVarianceLog(d.varianceLog);
    if(d.posLog)setPosLog(d.posLog);if(d.dark)setDark(d.dark);setLoaded(true);
  },[]);
  useEffect(()=>{if(auth)load();},[auth,load]);

  const save=useCallback(async(p,sn,ol,rc,pc,vl,pl,dk)=>{
    setSaving(true);
    await dbSave({products:p||products,snapshots:sn||snapshots,orderLog:ol||orderLog,recipes:rc||recipes,pourCostLog:pc||pourCostLog,varianceLog:vl||varianceLog,posLog:pl||posLog,dark:dk!==undefined?dk:dark,ts:new Date().toISOString()});
    setSaving(false);
  },[products,snapshots,orderLog,recipes,pourCostLog,varianceLog,posLog,dark]);

  const updateProduct=(id)=>{
    const np2=products.map(p=>p.id===id?{...p,barStock:parseFloat(ef.bar)||0,storStock:parseFloat(ef.stor)||0,cost:parseFloat(ef.cost)||p.cost,barPar:parseFloat(ef.barPar)??p.barPar,storPar:parseFloat(ef.storPar)??p.storPar,unit:ef.unit||p.unit,notes:ef.notes!==undefined?ef.notes:p.notes}:p);
    setProducts(np2);const wk=weekId();
    const snap={week:wk,date:new Date().toISOString(),items:np2.map(p=>({id:p.id,bar:p.barStock,stor:p.storStock}))};
    let ns=[...snapshots];const idx=ns.findIndex(s=>s.week===wk);if(idx>=0)ns[idx]=snap;else ns.push(snap);if(ns.length>52)ns=ns.slice(-52);
    setSnapshots(ns);save(np2,ns);setEditId(null);setEf({});
  };

  const addProduct=()=>{
    if(!np.name)return;
    const maxId=Math.max(...products.map(p=>p.id),0)+1;
    const newP=mk(maxId,np.cat,np.supplier,np.name,np.size,np.unit,parseFloat(np.barPar)||0,parseFloat(np.storPar)||0,np.rule,np.ruleNote,parseFloat(np.cost)||0,parseFloat(np.oz)||0);
    const updated=[...products,newP];setProducts(updated);save(updated);setShowAdd(false);
    setNp({name:"",cat:"Tequila",supplier:"Southern",size:"1L",unit:"btl",barPar:2,storPar:6,cost:0,oz:33.8,rule:"standard",ruleNote:""});
  };

  const updatePrice=()=>{
    if(!ipProd||!ipCost)return;
    const np2=products.map(p=>p.id===parseInt(ipProd)?{...p,cost:parseFloat(ipCost)}:p);
    setProducts(np2);
    const nl=[...orderLog,{id:Date.now(),date:new Date().toISOString(),supplier:"Price Update",items:`${products.find(p=>p.id===parseInt(ipProd))?.name}: $${ipCost}`,note:ipNote}];
    setOrderLog(nl);save(np2,null,nl);setIpProd("");setIpCost("");setIpNote("");
  };

  const logOrder=()=>{if(!orderSup||!orderItems)return;const nl=[...orderLog,{id:Date.now(),date:new Date().toISOString(),supplier:orderSup,items:orderItems,note:orderNote}];setOrderLog(nl);save(null,null,nl);setOrderSup("");setOrderItems("");setOrderNote("");};
  const saveRecipe=()=>{if(!rName)return;const vi=rIng.filter(i=>i.pid&&i.oz);const rec={id:rEditId||Date.now(),name:rName,ingredients:vi,menuPrice:parseFloat(rPrice)||0};const nr=rEditId?recipes.map(r=>r.id===rEditId?rec:r):[...recipes,rec];setRecipes(nr);save(null,null,null,nr);setRName("");setRIng([{pid:"",oz:""}]);setRPrice("");setREditId(null);};
  const recipeCost=(rec)=>{let t=0;rec.ingredients.forEach(i=>{const p=products.find(x=>x.id===parseInt(i.pid));if(p&&p.cost>0&&p.ozPerBottle>0)t+=(p.cost/p.ozPerBottle)*parseFloat(i.oz);});return t;};
  const savePourCost=()=>{const b=parseFloat(pcB)||0,pu=parseFloat(pcP)||0,e=parseFloat(pcE)||0,s=parseFloat(pcS)||0;if(!s)return;const cogs=b+pu-e;const nl=[...pourCostLog,{id:Date.now(),date:new Date().toISOString(),begin:b,purchases:pu,end:e,sales:s,cogs,pourCost:R((cogs/s)*100)}];setPourCostLog(nl);save(null,null,null,null,nl);setPcB("");setPcP("");setPcE("");setPcS("");};
  const saveVariance=()=>{if(!vProd)return;const nl=[...varianceLog,{id:Date.now(),date:new Date().toISOString(),productId:parseInt(vProd),expected:parseFloat(vExp)||0,actual:parseFloat(vAct)||0,variance:R((parseFloat(vAct)||0)-(parseFloat(vExp)||0)),note:vN}];setVarianceLog(nl);save(null,null,null,null,null,nl);setVProd("");setVExp("");setVAct("");setVN("");};
  const savePosEntry=()=>{if(!posProd||!posPours)return;const p=products.find(x=>x.id===parseInt(posProd));const pours=parseFloat(posPours)||0;const sz=parseFloat(posPourSz)||1.5;const totalOz=pours*sz;const btlUsed=p?.ozPerBottle>0?R(totalOz/p.ozPerBottle):0;const costUsed=btlUsed*p.cost;const nl=[...posLog,{id:Date.now(),date:new Date().toISOString(),productId:parseInt(posProd),pours,pourSize:sz,totalOz,btlUsed,costUsed}];setPosLog(nl);save(null,null,null,null,null,null,nl);setPosProd("");setPosPours("");setPosPourSz("1.5");};

  const getUsage=(pid)=>{if(snapshots.length<2)return[];const sorted=[...snapshots].sort((a,b)=>a.week.localeCompare(b.week));const u=[];for(let i=1;i<sorted.length;i++){const prev=sorted[i-1].items.find(x=>x.id===pid);const curr=sorted[i].items.find(x=>x.id===pid);if(prev&&curr)u.push({week:sorted[i].week,used:Math.max(0,(prev.bar+prev.stor)-(curr.bar+curr.stor))});}return u;};

  const stats=useMemo(()=>{let u=0,l=0,o=0;products.forEach(p=>{const s=getStatus(p);if(s.level==="urgent")u++;else if(["low","watch"].includes(s.level))l++;else if(s.level==="ok")o++;});return{u,l,o};},[products]);
  const totalVal=useMemo(()=>products.reduce((t,p)=>t+(p.cost*(p.barStock+p.storStock)),0),[products]);
  const filtered=useMemo(()=>{let f=[...products];if(filter==="urgent")f=f.filter(p=>getStatus(p).level==="urgent");else if(filter==="low")f=f.filter(p=>["low","watch"].includes(getStatus(p).level));else if(filter==="ok")f=f.filter(p=>getStatus(p).level==="ok");if(supFilter!=="all")f=f.filter(p=>p.supplier===supFilter);if(catFilter!=="all")f=f.filter(p=>p.cat===catFilter);if(search)f=f.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));return f;},[products,filter,supFilter,catFilter,search]);
  const supGroups=useMemo(()=>{const g={};products.forEach(p=>{const s=getStatus(p);if(["urgent","low","watch"].includes(s.level)){if(!g[p.supplier])g[p.supplier]=[];g[p.supplier].push({...p,status:s});}});return g;},[products]);
  const allIngredients=useMemo(()=>products.filter(p=>p.ozPerBottle>0).map(p=>({id:p.id,label:`${p.name} (${p.size}${p.cost?` $${p.cost}`:""})`})),[products]);

  const dayN=new Date().getDay();const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const deadlines=[...(dayN===0?[{s:"Shamrock",n:"Remind chef"}]:[]),...(dayN===1?[{s:"Shamrock",n:"ORDER by 5pm"},{s:"Southern",n:"Start (due Tue 3pm)"},{s:"Premier",n:"Start (due Wed noon)"},{s:"Admiral",n:"Start (due Wed 3pm)"},{s:"Fiasco",n:"Start (due Tue 3pm)"}]:[]),...(dayN===2?[{s:"Southern",n:"LAST DAY — 3pm"},{s:"Fiasco",n:"LAST DAY — 3pm"},{s:"RNDC",n:"Biweekly — 3pm"},{s:"Pepsi",n:"Before 2pm"},{s:"Shamrock",n:"DELIVERY"},{s:"Pepsi",n:"DELIVERY"}]:[]),...(dayN===3?[{s:"Premier",n:"LAST DAY — Noon"},{s:"Admiral",n:"LAST DAY — 3pm"}]:[]),...(dayN===4?[{s:"Southern",n:"DELIVERY"},{s:"Premier",n:"DELIVERY"},{s:"Fiasco",n:"DELIVERY"},{s:"RNDC",n:"DELIVERY"}]:[]),...(dayN===5?[{s:"Admiral",n:"DELIVERY"}]:[])];

  const generateOrderText=(sup)=>{
    const items=supGroups[sup];if(!items)return"";
    const info=SUP[sup];const name=info?.ct||sup;
    let txt=`Hey ${name}, need for this week:\n`;
    items.forEach(p=>{const need=Math.max(0,p.storPar-p.storStock);txt+=`• ${p.name}${need>0?` (need ${need} ${p.unit})`:""}\n`;});
    txt+=`\nThanks!`;return txt;
  };

  const bg=dark?"#1a1a2e":"#fff";const fg=dark?"#e0e0e0":"#333";const bg2=dark?"#16213e":"#f8f8f8";const bd=dark?"#2a2a4a":"#e8e8e8";const bg3=dark?"#0f3460":"#1B2A4A";

  const S={
    wrap:{fontFamily:"system-ui,-apple-system,sans-serif",maxWidth:800,margin:"0 auto",padding:"0 12px 80px",background:bg,color:fg,minHeight:"100vh"},
    nav:{display:"flex",gap:3,padding:"10px 0",borderBottom:`1px solid ${bd}`,marginBottom:14,flexWrap:"wrap",position:"sticky",top:0,background:bg,zIndex:10},
    nb:a=>({padding:"6px 10px",borderRadius:8,border:"none",fontSize:11,fontWeight:500,cursor:"pointer",background:a?bg3:(dark?"#2a2a4a":"#f0f0f0"),color:a?"#fff":fg}),
    card:{background:dark?"#16213e":"#fff",borderRadius:10,border:`1px solid ${bd}`,padding:14,marginBottom:10},
    badge:l=>({display:"inline-block",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:SC[l]?.bg,color:SC[l]?.tx,border:`1px solid ${SC[l]?.bd}`}),
    inp:{width:60,padding:"6px",borderRadius:6,border:`1px solid ${dark?"#444":"#ccc"}`,fontSize:14,textAlign:"center",background:dark?"#1a1a2e":"#fff",color:fg},
    inpF:{width:"100%",padding:"8px",borderRadius:6,border:`1px solid ${dark?"#444":"#ccc"}`,fontSize:13,boxSizing:"border-box",background:dark?"#1a1a2e":"#fff",color:fg},
    stat:c=>({flex:1,minWidth:65,padding:"10px 4px",borderRadius:10,textAlign:"center",background:c.bg,border:`1px solid ${c.bd}`,cursor:"pointer"}),
    sel:{padding:"6px 10px",borderRadius:6,border:`1px solid ${dark?"#444":"#ccc"}`,fontSize:12,background:dark?"#1a1a2e":"#fff",color:fg},
    btn:{padding:"8px 16px",borderRadius:6,border:"none",background:bg3,color:"#fff",fontSize:13,cursor:"pointer"},
    btnO:{padding:"8px 14px",borderRadius:6,border:`1px solid ${dark?"#444":"#ccc"}`,background:"transparent",fontSize:12,cursor:"pointer",color:fg},
    lbl:{fontSize:11,color:dark?"#888":"#888",marginBottom:2},
    ft:a=>({padding:"6px 12px",borderRadius:6,border:"none",fontSize:11,fontWeight:500,cursor:"pointer",background:a?"#2E5090":(dark?"#2a2a4a":"#e8e8e8"),color:a?"#fff":fg}),
    supH:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:bg3,color:"#fff",borderRadius:"10px 10px 0 0"},
  };

  if(!auth)return(<div style={{...S.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
    <div style={{fontSize:22,fontWeight:600,color:dark?"#e0e0e0":"#1B2A4A",marginBottom:4}}>Bar Ordering System</div>
    <p style={{color:"#888",fontSize:13,marginBottom:20}}>Enter password</p>
    <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwErr(false);}} onKeyDown={e=>{if(e.key==="Enter"){if(pw===PASSWORD)setAuth(true);else setPwErr(true);}}} placeholder="Password" style={{padding:"10px 16px",borderRadius:8,border:`1px solid ${pwErr?"#e24b4a":"#ccc"}`,fontSize:16,width:220,textAlign:"center",marginBottom:10}} autoFocus/>
    <button onClick={()=>{if(pw===PASSWORD)setAuth(true);else setPwErr(true);}} style={S.btn}>Enter</button>
    {pwErr&&<p style={{color:"#e24b4a",fontSize:13,marginTop:8}}>Wrong password</p>}
  </div>);

  if(!loaded)return<div style={S.wrap}><p style={{textAlign:"center",padding:40,color:"#888"}}>Loading...</p></div>;

  return(<div style={S.wrap}>
    <div style={{padding:"14px 0 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h1 style={{margin:0,fontSize:20,fontWeight:600,color:dark?"#e0e0e0":"#1B2A4A"}}>KTaos Bar</h1>
      <p style={{margin:"2px 0 0",fontSize:11,color:"#888"}}>{days[dayN]}{totalVal>0?` · $${Math.round(totalVal).toLocaleString()}`:""} · {products.filter(p=>p.cost>0).length} costed{saving?" · Saving...":""}</p></div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>{const nd=!dark;setDark(nd);save(null,null,null,null,null,null,null,nd);}} style={{fontSize:18,background:"none",border:"none",cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
        <button onClick={()=>setAuth(false)} style={{fontSize:11,color:"#999",background:"none",border:"none",cursor:"pointer"}}>Lock</button>
      </div>
    </div>

    <div style={S.nav}>
      {[["dashboard","Home"],["inventory","Inventory"],["orders","Orders"],["recipes","Recipes"],["finance","Finance"],["log","Log"],["history","History"],["suppliers","Contacts"]].map(([v,l])=><button key={v} style={S.nb(view===v)} onClick={()=>setView(v)}>{l}</button>)}
    </div>

    {/* DASHBOARD */}
    {view==="dashboard"&&<>
      {deadlines.length>0&&<div style={{...S.card,background:dark?"#332b00":"#FFFBEB",borderColor:"#FAC775"}}><div style={{fontSize:13,fontWeight:600,color:"#FAC775",marginBottom:6}}>Today</div>{deadlines.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12}}><span style={{fontWeight:500}}>{d.s}</span><span style={{color:d.n.includes("DELIVERY")?"#4ade80":d.n.includes("LAST")?"#f87171":"inherit"}}>{d.n}</span></div>)}</div>}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        <div style={S.stat(SC.urgent)} onClick={()=>{setView("inventory");setFilter("urgent");}}><div style={{fontSize:22,fontWeight:600,color:SC.urgent.tx}}>{stats.u}</div><div style={{fontSize:10,color:SC.urgent.tx}}>Urgent</div></div>
        <div style={S.stat(SC.low)} onClick={()=>{setView("inventory");setFilter("low");}}><div style={{fontSize:22,fontWeight:600,color:SC.low.tx}}>{stats.l}</div><div style={{fontSize:10,color:SC.low.tx}}>Low</div></div>
        <div style={S.stat(SC.ok)} onClick={()=>{setView("inventory");setFilter("ok");}}><div style={{fontSize:22,fontWeight:600,color:SC.ok.tx}}>{stats.o}</div><div style={{fontSize:10,color:SC.ok.tx}}>Good</div></div>
      </div>
      {pourCostLog.length>0&&<div style={{...S.card,background:dark?"#0a1628":"#f0f4ff"}}><div style={{fontSize:13,fontWeight:600}}>Pour cost</div><div style={{fontSize:28,fontWeight:600,color:pourCostLog[pourCostLog.length-1].pourCost>25?"#f87171":"#4ade80"}}>{pourCostLog[pourCostLog.length-1].pourCost}%</div></div>}
      <div style={S.card}><div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Needs attention</div>
        {products.filter(p=>["urgent","low","watch"].includes(getStatus(p).level)).slice(0,15).map(p=>{const s=getStatus(p);return<div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${bd}`}}><div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.supplier} · B:{p.barStock} S:{p.storStock}</div></div><span style={S.badge(s.level)}>{s.label}</span></div>;})}
      </div>
    </>}

    {/* INVENTORY */}
    {view==="inventory"&&<>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        {[["all","All"],["urgent","Urgent"],["low","Low"],["ok","Good"]].map(([f,l])=><button key={f} style={{...S.nb(filter===f),fontSize:11,padding:"5px 10px"}} onClick={()=>setFilter(f)}>{l}</button>)}
        <button onClick={()=>setShowAdd(!showAdd)} style={{...S.nb(showAdd),fontSize:11,padding:"5px 10px"}}>+ Add</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={S.sel}><option value="all">All categories</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
        <select value={supFilter} onChange={e=>setSupFilter(e.target.value)} style={S.sel}><option value="all">All suppliers</option>{Object.keys(SUP).map(s=><option key={s} value={s}>{s}</option>)}</select>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:100,...S.inpF,padding:"6px 10px"}}/>
      </div>

      {showAdd&&<div style={{...S.card,borderColor:"#4ade80"}}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Add new product</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={S.lbl}>Name</div><input value={np.name} onChange={e=>setNp({...np,name:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Category</div><select value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})} style={{...S.sel,width:"100%"}}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><div style={S.lbl}>Supplier</div><select value={np.supplier} onChange={e=>setNp({...np,supplier:e.target.value})} style={{...S.sel,width:"100%"}}>{Object.keys(SUP).map(s=><option key={s}>{s}</option>)}</select></div>
          <div><div style={S.lbl}>Size</div><input value={np.size} onChange={e=>setNp({...np,size:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Unit (btl/case/keg)</div><input value={np.unit} onChange={e=>setNp({...np,unit:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Cost ($)</div><input value={np.cost} onChange={e=>setNp({...np,cost:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Bar par</div><input value={np.barPar} onChange={e=>setNp({...np,barPar:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Storage par</div><input value={np.storPar} onChange={e=>setNp({...np,storPar:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Oz per bottle</div><input value={np.oz} onChange={e=>setNp({...np,oz:e.target.value})} style={S.inpF}/></div>
        </div>
        <button onClick={addProduct} style={S.btn}>Add product</button>
      </div>}

      <div style={{fontSize:11,color:"#888",marginBottom:6}}>{filtered.length} items</div>
      {filtered.map(p=>{const s=getStatus(p);const ed=editId===p.id;const usage=getUsage(p.id);const avg=usage.length>0?R(usage.reduce((a,u)=>a+u.used,0)/usage.length):null;
        return<div key={p.id} style={{...S.card,padding:10,borderLeftColor:SC[s.level]?.bd||bd,borderLeftWidth:3,borderLeftStyle:"solid"}} onClick={()=>{if(!ed){setEditId(p.id);setEf({bar:String(p.barStock),stor:String(p.storStock),cost:String(p.cost||""),barPar:String(p.barPar),storPar:String(p.storPar),unit:p.unit,notes:p.notes||""});}}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.supplier} · {p.size} · {p.unit}{p.cost>0?` · $${p.cost}`:""}</div>{p.ruleNote&&<div style={{fontSize:10,color:"#b45309",marginTop:1}}>{p.ruleNote}</div>}{p.notes&&<div style={{fontSize:10,color:"#6b9bd2",marginTop:1}}>📝 {p.notes}</div>}{avg!==null&&<div style={{fontSize:10,color:"#888",marginTop:1}}>Avg: {avg}/wk</div>}</div>
            <div style={{textAlign:"right"}}><span style={S.badge(s.level)}>{s.label}</span>{!ed&&<div style={{fontSize:10,color:"#888",marginTop:2}}>B:{p.barStock}/{p.barPar} S:{p.storStock}/{p.storPar}</div>}</div>
          </div>
          {ed&&<div style={{marginTop:8}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
              <div><div style={S.lbl}>Bar (par:{ef.barPar})</div><input value={ef.bar} onChange={e=>setEf({...ef,bar:e.target.value})} style={S.inp} autoFocus/></div>
              <div><div style={S.lbl}>Storage (par:{ef.storPar})</div><input value={ef.stor} onChange={e=>setEf({...ef,stor:e.target.value})} style={S.inp}/></div>
              <div><div style={S.lbl}>Cost $</div><input value={ef.cost} onChange={e=>setEf({...ef,cost:e.target.value})} style={{...S.inp,width:70}}/></div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
              <div><div style={S.lbl}>Bar par</div><input value={ef.barPar} onChange={e=>setEf({...ef,barPar:e.target.value})} style={{...S.inp,width:50}}/></div>
              <div><div style={S.lbl}>Stor par</div><input value={ef.storPar} onChange={e=>setEf({...ef,storPar:e.target.value})} style={{...S.inp,width:50}}/></div>
              <div><div style={S.lbl}>Unit</div><input value={ef.unit} onChange={e=>setEf({...ef,unit:e.target.value})} style={{...S.inp,width:50}}/></div>
            </div>
            <div style={{marginBottom:8}}><div style={S.lbl}>Notes</div><input value={ef.notes} onChange={e=>setEf({...ef,notes:e.target.value})} style={S.inpF} placeholder="Add a note..."/></div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>updateProduct(p.id)} style={S.btn}>Save</button>
              <button onClick={e=>{e.stopPropagation();setEditId(null);}} style={S.btnO}>Cancel</button>
            </div>
          </div>}
        </div>;})}
    </>}

    {/* ORDERS */}
    {view==="orders"&&<>
      {Object.entries(supGroups).sort(([,a],[,b])=>b.filter(x=>x.status.level==="urgent").length-a.filter(x=>x.status.level==="urgent").length).map(([sup,items])=>{const info=SUP[sup];return<div key={sup} style={{marginBottom:14,borderRadius:10,overflow:"hidden",border:`1px solid ${bd}`}}>
        <div style={S.supH}><div><div style={{fontSize:14,fontWeight:600}}>{sup}</div><div style={{fontSize:10,opacity:0.8}}>By: {info?.dl||"—"} · Del: {info?.del||"—"}</div></div><div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{background:"#fff",color:"#1B2A4A",borderRadius:12,padding:"2px 8px",fontSize:11,fontWeight:600}}>{items.length}</div>
        <button onClick={()=>{navigator.clipboard.writeText(generateOrderText(sup));setGenOrderSup(sup);setTimeout(()=>setGenOrderSup(""),2000);}} style={{background:"#fff3",border:"1px solid #fff5",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#fff",cursor:"pointer"}}>{genOrderSup===sup?"Copied!":"📋 Copy"}</button></div></div>
        {items.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",borderBottom:`1px solid ${bd}`,background:SC[p.status.level]?.bg}}><div><div style={{fontSize:12,fontWeight:500,color:"#333"}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.size} · B:{p.barStock}/{p.barPar} · S:{p.storStock}/{p.storPar}</div></div><span style={S.badge(p.status.level)}>{p.status.label}</span></div>)}
        {info?.ph&&<div style={{padding:"6px 14px",fontSize:11,color:"#888",background:dark?"#1a1a2e":"#fafafa"}}>{info.ph}{info.ct?` (${info.ct})`:""}</div>}
      </div>;})}
      {Object.keys(supGroups).length===0&&<div style={{...S.card,textAlign:"center",color:"#888"}}>Everything's at par!</div>}
    </>}

    {/* RECIPES */}
    {view==="recipes"&&<>
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{rEditId?"Edit":"New"} recipe</div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Drink name</div><input value={rName} onChange={e=>setRName(e.target.value)} style={S.inpF}/></div>
        <div style={S.lbl}>Ingredients (all spirits + mixers)</div>
        {rIng.map((ing,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
          <div style={{flex:1}}><SearchSelect items={allIngredients} value={ing.pid} onChange={v=>{const n=[...rIng];n[i].pid=v;setRIng(n);}} placeholder="Search ingredient..."/></div>
          <input value={ing.oz} onChange={e=>{const n=[...rIng];n[i].oz=e.target.value;setRIng(n);}} style={{...S.inp,width:45}} placeholder="oz"/>
          <span style={{fontSize:11,color:"#888"}}>oz</span>
          {rIng.length>1&&<button onClick={()=>setRIng(rIng.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:16}}>×</button>}
        </div>)}
        <button onClick={()=>setRIng([...rIng,{pid:"",oz:""}])} style={{...S.btnO,fontSize:11,marginBottom:10}}>+ ingredient</button>
        <div style={{marginBottom:8}}><div style={S.lbl}>Menu price ($)</div><input value={rPrice} onChange={e=>setRPrice(e.target.value)} style={{...S.inp,width:80}}/></div>
        <button onClick={saveRecipe} style={S.btn}>{rEditId?"Update":"Save"}</button>
      </div>
      {recipes.map(r=>{const cost=recipeCost(r);const pour=r.menuPrice>0?R((cost/r.menuPrice)*100):0;const profit=r.menuPrice-cost;const margin=r.menuPrice>0?R((profit/r.menuPrice)*100):0;
        return<div key={r.id} style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600}}>{r.name}</div>
              {r.ingredients.map((ing,i)=>{const p=products.find(x=>x.id===parseInt(ing.pid));const ic=p&&p.cost&&p.ozPerBottle?R(p.cost/p.ozPerBottle*parseFloat(ing.oz)):0;return<div key={i} style={{fontSize:11,color:"#888"}}>{ing.oz}oz {p?.name||"?"}{ic?` ($${ic.toFixed(2)})`:""}</div>;})}
            </div>
            <div style={{textAlign:"right"}}>
              {cost>0&&<div style={{fontSize:18,fontWeight:600}}>${cost.toFixed(2)} <span style={{fontSize:10,fontWeight:400,color:"#888"}}>cost</span></div>}
              {r.menuPrice>0&&<><div style={{fontSize:13,color:"#888"}}>${r.menuPrice} menu</div>
              <div style={{fontSize:13,fontWeight:600,color:pour>25?"#f87171":"#4ade80"}}>{pour}% pour</div>
              <div style={{fontSize:12,color:"#4ade80"}}>${profit.toFixed(2)} profit ({margin}%)</div></>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>{setREditId(r.id);setRName(r.name);setRIng(r.ingredients.length?r.ingredients:[{pid:"",oz:""}]);setRPrice(String(r.menuPrice||""));}} style={S.btnO}>Edit</button>
            <button onClick={()=>{const nr=recipes.filter(x=>x.id!==r.id);setRecipes(nr);save(null,null,null,nr);}} style={{...S.btnO,color:"#f87171"}}>Delete</button>
          </div>
        </div>;})}
    </>}

    {/* FINANCE */}
    {view==="finance"&&<>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>{[["pour","Pour cost"],["pos","POS Compare"],["pricing","Pricing"],["variance","Variance"],["value","Value"],["prices","Update Prices"]].map(([t,l])=><button key={t} style={S.ft(finTab===t)} onClick={()=>setFinTab(t)}>{l}</button>)}</div>

      {finTab==="pour"&&<><div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Pour cost calculator</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div><div style={S.lbl}>Beginning inv ($)</div><input value={pcB} onChange={e=>setPcB(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Purchases ($)</div><input value={pcP} onChange={e=>setPcP(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Ending inv ($)</div><input value={pcE} onChange={e=>setPcE(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Total sales ($)</div><input value={pcS} onChange={e=>setPcS(e.target.value)} style={S.inpF}/></div>
        </div>
        {pcS&&parseFloat(pcS)>0&&(()=>{const cogs=(parseFloat(pcB)||0)+(parseFloat(pcP)||0)-(parseFloat(pcE)||0);const pc=R(cogs/(parseFloat(pcS)||1)*100);return<div style={{background:dark?"#0a1628":"#f0f4ff",borderRadius:8,padding:12,marginBottom:10}}><div style={{fontSize:11,color:"#888"}}>COGS: ${cogs.toFixed(2)}</div><div style={{fontSize:28,fontWeight:600,color:pc>25?"#f87171":"#4ade80"}}>{pc}%</div></div>;})()}
        <button onClick={savePourCost} style={S.btn}>Save period</button>
      </div>
      {pourCostLog.length>0&&[...pourCostLog].reverse().slice(0,10).map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${bd}`,fontSize:12}}><span>{new Date(e.date).toLocaleDateString()}</span><span>Sales: ${e.sales.toLocaleString()}</span><span style={{fontWeight:600,color:e.pourCost>25?"#f87171":"#4ade80"}}>{e.pourCost}%</span></div>)}</>}

      {finTab==="pos"&&<><div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>POS vs Inventory</div>
        <p style={{fontSize:12,color:"#888",marginBottom:10}}>Enter pours sold from POS to compare against actual inventory usage</p>
        <div style={{marginBottom:8}}><div style={S.lbl}>Product</div><SearchSelect items={allIngredients} value={posProd} onChange={setPosProd} placeholder="Search product..."/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div><div style={S.lbl}>Pours sold (POS)</div><input value={posPours} onChange={e=>setPosPours(e.target.value)} style={S.inpF} placeholder="e.g. 145"/></div>
          <div><div style={S.lbl}>Pour size (oz)</div><input value={posPourSz} onChange={e=>setPosPourSz(e.target.value)} style={S.inpF}/></div>
        </div>
        {posProd&&posPours&&(()=>{const p=products.find(x=>x.id===parseInt(posProd));const pours=parseFloat(posPours)||0;const sz=parseFloat(posPourSz)||1.5;const totalOz=pours*sz;const btl=p?.ozPerBottle>0?R(totalOz/p.ozPerBottle):0;const costUsed=R(btl*(p?.cost||0));
          return<div style={{background:dark?"#0a1628":"#f0f4ff",borderRadius:8,padding:12,marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:500}}>{p?.name}</div>
            <div style={{fontSize:12,color:"#888"}}>{pours} pours × {sz}oz = {totalOz}oz total</div>
            <div style={{fontSize:20,fontWeight:600}}>{btl} bottles used</div>
            <div style={{fontSize:12,color:"#888"}}>Cost: ${costUsed}</div>
          </div>;})()}
        <button onClick={savePosEntry} style={S.btn}>Log entry</button>
      </div>
      {posLog.length>0&&<div style={{fontSize:13,fontWeight:500,margin:"12px 0 8px"}}>POS history</div>}
      {[...posLog].reverse().slice(0,15).map(e=>{const p=products.find(x=>x.id===e.productId);return<div key={e.id} style={{...S.card,padding:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:500}}>{p?.name||"?"}</span><span style={{fontSize:11,color:"#888"}}>{new Date(e.date).toLocaleDateString()}</span></div><div style={{fontSize:12}}>{e.pours} pours × {e.pourSize}oz = {e.btlUsed} btl (${R(e.costUsed)})</div></div>;})}</>}

      {finTab==="pricing"&&<div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Drink pricing</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div><div style={S.lbl}>Bottle cost ($)</div><input value={dpC} onChange={e=>setDpC(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Bottle oz</div><input value={dpB} onChange={e=>setDpB(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Pour oz</div><input value={dpP} onChange={e=>setDpP(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Target %</div><input value={dpT} onChange={e=>setDpT(e.target.value)} style={S.inpF}/></div>
        </div>
        {dpC&&(()=>{const c=parseFloat(dpC)||0,bo=parseFloat(dpB)||1,po=parseFloat(dpP)||1,t=parseFloat(dpT)||20;const cpd=R(c/bo*po);const sug=R(cpd/(t/100));return<div style={{background:dark?"#0a1628":"#f0f4ff",borderRadius:8,padding:12}}><div style={{fontSize:11,color:"#888"}}>Cost/drink: ${cpd.toFixed(2)} · {Math.floor(bo/po)} drinks/btl</div><div style={{fontSize:28,fontWeight:600}}>Charge: ${sug.toFixed(2)}</div><div style={{fontSize:11,color:"#888"}}>Profit: ${R(sug-cpd).toFixed(2)}/drink · Margin: {R(((sug-cpd)/sug)*100)}%</div></div>;})()}
      </div>}

      {finTab==="variance"&&<><div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Variance</div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Product</div><SearchSelect items={allIngredients} value={vProd} onChange={setVProd} placeholder="Search..."/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={S.lbl}>Expected</div><input value={vExp} onChange={e=>setVExp(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Actual</div><input value={vAct} onChange={e=>setVAct(e.target.value)} style={S.inpF}/></div>
        </div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Notes</div><input value={vN} onChange={e=>setVN(e.target.value)} style={S.inpF}/></div>
        <button onClick={saveVariance} style={S.btn}>Log</button>
      </div>
      {varianceLog.length>0&&[...varianceLog].reverse().slice(0,10).map(e=>{const p=products.find(x=>x.id===e.productId);return<div key={e.id} style={{...S.card,padding:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:500}}>{p?.name||"?"}</span><span style={{fontSize:11,color:"#888"}}>{new Date(e.date).toLocaleDateString()}</span></div><div style={{fontSize:12}}>Exp:{e.expected} Act:{e.actual} <span style={{fontWeight:600,color:Math.abs(e.variance)>(e.expected*0.05)?"#f87171":"#4ade80"}}>Var:{e.variance>0?"+":""}{e.variance}</span></div></div>;})}</>}

      {finTab==="value"&&<>
        <div style={{...S.card,background:dark?"#0a1628":"#f0f4ff"}}><div style={{fontSize:13,fontWeight:600}}>Total value</div><div style={{fontSize:32,fontWeight:600}}>${Math.round(totalVal).toLocaleString()}</div><div style={{fontSize:11,color:"#888"}}>{products.filter(p=>p.cost>0).length}/{products.length} costed</div></div>
        {products.filter(p=>p.cost>0).sort((a,b)=>(b.cost*(b.barStock+b.storStock))-(a.cost*(a.barStock+a.storStock))).slice(0,20).map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${bd}`,fontSize:12}}><span>{p.name}</span><span style={{fontWeight:600}}>${Math.round(p.cost*(p.barStock+p.storStock))}</span></div>)}
      </>}

      {finTab==="prices"&&<div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Update price from invoice</div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Product</div><SearchSelect items={products.map(p=>({id:p.id,label:`${p.name} (${p.supplier}) ${p.cost?`$${p.cost}`:""}`}))} value={ipProd} onChange={setIpProd} placeholder="Search product..."/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={S.lbl}>New cost ($)</div><input value={ipCost} onChange={e=>setIpCost(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Invoice note</div><input value={ipNote} onChange={e=>setIpNote(e.target.value)} style={S.inpF} placeholder="e.g. Inv #1234"/></div>
        </div>
        {ipProd&&(()=>{const p=products.find(x=>x.id===parseInt(ipProd));return p?<div style={{fontSize:12,color:"#888",marginBottom:8}}>Current: ${p.cost||"none"} → New: ${ipCost||"?"}</div>:null;})()}
        <button onClick={updatePrice} style={S.btn}>Update price</button>
      </div>}
    </>}

    {/* LOG */}
    {view==="log"&&<><div style={S.card}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Log order</div>
      <div style={{marginBottom:8}}><div style={S.lbl}>Supplier</div><select value={orderSup} onChange={e=>setOrderSup(e.target.value)} style={{...S.sel,width:"100%"}}><option value="">Select</option>{Object.keys(SUP).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
      <div style={{marginBottom:8}}><div style={S.lbl}>Items ordered/received</div><textarea value={orderItems} onChange={e=>setOrderItems(e.target.value)} rows={3} style={{...S.inpF,resize:"vertical"}}/></div>
      <div style={{marginBottom:10}}><div style={S.lbl}>Notes</div><input value={orderNote} onChange={e=>setOrderNote(e.target.value)} style={S.inpF}/></div>
      <button onClick={logOrder} style={S.btn}>Save</button>
    </div>
    {orderLog.slice(-20).reverse().map(o=><div key={o.id} style={{...S.card,padding:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:500}}>{o.supplier}</span><span style={{fontSize:11,color:"#888"}}>{new Date(o.date).toLocaleDateString()}</span></div><div style={{fontSize:12}}>{o.items}</div>{o.note&&<div style={{fontSize:11,color:"#888"}}>{o.note}</div>}</div>)}</>}

    {/* HISTORY */}
    {view==="history"&&<>
      <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Snapshots & Usage</div>
      {snapshots.length<2&&<p style={{fontSize:12,color:"#888"}}>Need 2+ weekly snapshots to see usage trends.</p>}
      {snapshots.length>=2&&<>
        <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>Top movers (avg/wk)</div>
        {(()=>{const um={};products.forEach(p=>{const u=getUsage(p.id);if(u.length>0){const avg=u.reduce((a,x)=>a+x.used,0)/u.length;if(avg>0)um[p.id]={name:p.name,sup:p.supplier,avg:R(avg)};}});return Object.values(um).sort((a,b)=>b.avg-a.avg).slice(0,20).map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${bd}`,fontSize:12}}><span>{item.name} <span style={{color:"#888"}}>({item.sup})</span></span><span style={{fontWeight:500}}>{item.avg}/wk</span></div>);})()}
      </>}
      <div style={{fontSize:13,fontWeight:500,margin:"16px 0 8px"}}>Snapshots ({snapshots.length})</div>
      {[...snapshots].reverse().slice(0,20).map((snap,i)=><div key={i}>
        <div style={{...S.card,padding:10,cursor:"pointer"}} onClick={()=>setSnapView(snapView===snap.week?null:snap.week)}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:500}}>Week of {snap.week}</span><span style={{fontSize:11,color:"#888"}}>{new Date(snap.date).toLocaleString()}</span></div>
        </div>
        {snapView===snap.week&&<div style={{...S.card,marginTop:-6,borderTop:"none",borderRadius:"0 0 10px 10px",maxHeight:400,overflow:"auto"}}>
          {snap.items.filter(it=>(it.bar+it.stor)>0).sort((a,b)=>(b.bar+b.stor)-(a.bar+a.stor)).map(it=>{const p=products.find(x=>x.id===it.id);if(!p)return null;return<div key={it.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${bd}`,fontSize:11}}><span>{p.name}</span><span style={{color:"#888"}}>B:{it.bar} S:{it.stor} = {R(it.bar+it.stor)}</span></div>;})}
        </div>}
      </div>)}
    </>}

    {/* CONTACTS */}
    {view==="suppliers"&&Object.entries(SUP).map(([name,info])=><div key={name} style={{...S.card,padding:12}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{name}</div>
      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"3px 10px",fontSize:12}}>
        <span style={{color:"#888"}}>Window:</span><span>{info.win}</span>
        <span style={{color:"#888"}}>Deadline:</span><span>{info.dl}</span>
        <span style={{color:"#888"}}>Delivery:</span><span>{info.del}</span>
        {info.ct&&<><span style={{color:"#888"}}>Contact:</span><span>{info.ct}</span></>}
        {info.ph&&<><span style={{color:"#888"}}>Phone:</span><span>{info.ph}</span></>}
        {info.url&&<><span style={{color:"#888"}}>Portal:</span><span style={{wordBreak:"break-all"}}><a href={info.url.startsWith("http")?info.url:`https://${info.url}`} target="_blank" rel="noreferrer" style={{color:"#60a5fa"}}>{info.url}</a></span></>}
      </div>
    </div>)}
  </div>);
}
