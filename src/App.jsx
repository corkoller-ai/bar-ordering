import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
);

const PASSWORD = "DaleeeOrders";
const SUPPLIERS = {
  Premier:{deadline:"Before Noon Wed",delivery:"Thursday",contact:"Aaron Montoya",phone:"505-614-5656",portal:"https://mybeesapp.com/customer/account",window:"Mon–Wed"},
  Admiral:{deadline:"Before 3pm Wed",delivery:"Friday",contact:"Michael Martinez",phone:"(575) 770-6592",portal:"https://apps.vtinfo.com/retailer-portal/00785/retailer/S1774",window:"Mon–Wed"},
  Southern:{deadline:"Before 3pm Tue",delivery:"Thursday",contact:"Sydnie",phone:"(505) 458-1627",portal:"https://shop.sgproof.com",window:"Mon–Tue"},
  RNDC:{deadline:"Before 3pm (biweekly)",delivery:"Thursday",contact:"Jim",phone:"(575) 779-4745",portal:"https://app.erndc.com/login",window:"Mon/Tue biweekly"},
  Fiasco:{deadline:"Before 3pm Tue",delivery:"Thursday",contact:"NOVA",phone:"575-7794440",portal:"",window:"Mon–Tue"},
  "Rolling Still":{deadline:"Coordinate w/ Dan",delivery:"Coordinate",contact:"Dan",phone:"575-779-7977",portal:"",window:"As needed"},
  "Bow & Arrow":{deadline:"Contact Peter Moore",delivery:"Every 2 weeks",contact:"Peter Moore",phone:"",portal:"",window:"Biweekly"},
  Pepsi:{deadline:"Before 2pm Tue",delivery:"Tuesday",contact:"Kevin",phone:"505-595-5858",portal:"https://www.pepsicopartners.com/",window:"Before Tue"},
  Shamrock:{deadline:"Before 5pm Mon",delivery:"Tuesday",contact:"",phone:"",portal:"https://shamrockorders.com/Catalog?svn=05",window:"Monday"},
  Webstaurante:{deadline:"None",delivery:"Varies",contact:"",phone:"",portal:"webstaurantstore.com",window:"As needed"},
  "Mathenson CO2":{deadline:"Check timing",delivery:"Mon or Tue",contact:"",phone:"505-982-1997",portal:"",window:"As needed"},
  TBD:{deadline:"",delivery:"",contact:"",phone:"",portal:"",window:""},
};

const P=(id,cat,sup,name,size,bP,sP,rule,note,cost,oz)=>({id,cat,supplier:sup,name,size,barPar:bP,barStock:bP,storPar:sP,storStock:sP,rule:rule||"standard",ruleNote:note||"",cost:cost||0,ozPerBottle:oz||0});

const INIT=[
  P(1,"Beer - Domestic","Premier","Michelob Ultra","12oz Btl (24pk)",19,3,"standard","",24.60,0),
  P(2,"Beer - Domestic","Premier","Bud Light","12oz Btl (24pk)",19,3,"standard","",19.80,0),
  P(3,"Beer - Domestic","Premier","Budweiser","12oz Btl (18pk)",29,3,"standard","",16.30,0),
  P(4,"Beer - Domestic","Admiral","Coors Light","12oz 2/12pk",12,3,"standard","",22.30,0),
  P(5,"Beer - Domestic","Admiral","PBR","12oz Cans (30pk)",50,3,"standard","",23.74,0),
  P(6,"Beer - Import","Premier","Stella Artois","11.2oz Btl",24,3,"standard","",28.00,0),
  P(7,"Beer - Import","Admiral","Corona","12oz Btl (24bt)",37,4,"standard","",29.78,0),
  P(8,"Beer - Import","Admiral","Modelo Especial","12oz 24pk",54,10,"standard","",29.78,0),
  P(9,"Beer - Import","Admiral","Modelo Negra","12oz 4/6pk",20,3,"standard","",32.30,0),
  P(10,"Beer - Import","Admiral","Guinness","11.2oz 2/12pk",12,3,"standard","",31.00,0),
  P(11,"Beer - Import","Admiral","Tecate","12oz 30pk",32,3,"standard","",28.75,0),
  P(12,"Beer - Import","Admiral","Dos Equis","12oz 24pk",36,8,"standard","",26.80,0),
  P(13,"Beer - Craft","Premier","Ex Novo Mass Ascension","16oz (6x4pk)",12,4,"standard","",49.50,0),
  P(14,"Beer - Craft","Premier","Austin Eastciders Original","12oz (4x6pk)",19,1,"standard","",31.50,0),
  P(15,"Beer - Craft","Premier","Austin Eastciders Blood Orange","12oz (4x6pk)",24,2,"standard","",31.50,0),
  P(16,"Beer - Craft","Admiral","Angry Orchard","12oz 4/6pk",7,1,"standard","",32.50,0),
  P(17,"NA Beer","Admiral","Athletic Upside Dawn","12oz 2/12pk",18,1,"standard","",32.00,0),
  P(18,"NA Beer","Admiral","Athletic IPA","12oz 2/12pk",18,1,"standard","",32.00,0),
  P(19,"Soda / NA","Premier","Zia Vida Root Beer","12pk Bottles",7,1,"standard","",16.80,0),
  P(20,"Soda / NA","Premier","Zia Vida Sandia","12pk Bottles",7,1,"standard","",16.80,0),
  P(21,"Soda / NA","Admiral","Red Bull","8.4oz 6/4pk",20,1,"standard","",42.15,0),
  P(22,"Soda / NA","Admiral","Jarritos / Mineragua","12.5oz 12pk",6,1,"standard","",10.24,0),
  P(23,"Soda / NA","Southern","Goslings Ginger Beer","12oz 4/6pk",10,2,"standard","",7.00,12),
  P(24,"Wine","Fiasco","Malbec","750ml",3,1,"below_threshold","Reorder if storage < 0.5",11.00,25.4),
  P(25,"Wine","Fiasco","Pinot Noir","750ml",3,1,"below_threshold","Reorder if storage < 0.5",10.99,25.4),
  P(26,"Wine","Fiasco","Chardonnay","750ml",6,1,"below_threshold","Reorder if storage < 0.5",10.00,25.4),
  P(27,"Wine","Fiasco","Sauvignon Blanc","750ml",6,1,"below_threshold","Reorder if storage < 0.5",9.99,25.4),
  P(28,"Wine","Fiasco","Prosecco","750ml",4,1,"below_threshold","Reorder if storage < 0.5",13.00,25.4),
  P(29,"Wine","Fiasco","Vinho Verde","750ml",6,1,"below_threshold","Reorder if storage < 0.5",7.87,25.4),
  P(30,"Tequila","Southern","Mi Campo Blanco","1L",4,2,"always_full","ALWAYS need 2 full cases",14.39,33.8),
  P(31,"Tequila","Southern","Mi Campo Reposado","1L",2,1,"standard","",0,33.8),
  P(32,"Tequila","Southern","Espolon Blanco","1L",2,1,"standard","",24.99,33.8),
  P(33,"Tequila","Southern","Hornitos Plata","1L",2,1,"standard","",32.59,33.8),
  P(34,"Tequila","Southern","Hornitos Reposado","1L",2,1,"standard","Often free w/ Plata deal",0,33.8),
  P(35,"Tequila","Southern","Patron Silver","750ml",2,1,"standard","",44.59,25.4),
  P(36,"Tequila","Southern","Don Julio Blanco","1L",2,1,"standard","",48.59,33.8),
  P(37,"Tequila","Southern","De Leon Blanco","750ml",2,0),
  P(38,"Tequila","Southern","Teremana Blanco","1L",1,0,"standard","",32.59,33.8),
  P(39,"Tequila","Southern","Casa Noble Reposado","750ml",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,25.4),
  P(40,"Tequila","Southern","Casa Noble Anejo","750ml",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,25.4),
  P(41,"Tequila","Southern","Sauza Hacienda Gold","1L",1,0,"discontinue","Let it run out",0,33.8),
  P(42,"Vodka","Southern","Tito's","1L",2,4,"standard","~$27.44 eff (buy 3 get 1)",27.44,33.8),
  P(43,"Vodka","Southern","Grey Goose","1L",2,0,"standard","",43.59,33.8),
  P(44,"Vodka","Rolling Still","Green Chile Vodka","750ml",2,1),
  P(45,"Vodka","Rolling Still","Red Chile Vodka","750ml",2,1),
  P(46,"Vodka","Rolling Still","Pecan Vodka","750ml",2,0),
  P(47,"Vodka","Rolling Still","Lavender Vodka","750ml",2,0),
  P(48,"Vodka","Rolling Still","Regular Vodka","750ml",2,0),
  P(49,"Vodka","RNDC","New Amsterdam Vodka","1L",4,1,"standard","",10.99,33.8),
  P(50,"Vodka","RNDC","Ketel One","1L",2,1,"standard","",33.99,33.8),
  P(51,"Whiskey","Southern","Chivas Regal 12yr","1L",2,0,"standard","",39.00,33.8),
  P(52,"Whiskey","Southern","Maker's Mark","1L",2,1,"standard","~$31.67 eff (buy 4 get 1)",31.67,33.8),
  P(53,"Whiskey","Southern","Bulleit Rye","1L",2,1,"standard","~$18.80 eff (buy 1 get 1)",18.80,33.8),
  P(54,"Whiskey","Southern","Crown Royal","750ml",2,1,"standard","",31.09,25.4),
  P(55,"Whiskey","Southern","Crown Royal Peach","750ml",2,1,"standard","",30.99,25.4),
  P(56,"Whiskey","Southern","Wild Turkey 101","1L",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",31.59,33.8),
  P(57,"Whiskey","Southern","Angel's Envy","750ml",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",43.59,25.4),
  P(58,"Whiskey","Southern","Jim Beam","1L",2,2,"standard","",22.19,33.8),
  P(59,"Whiskey","RNDC","Jameson","1L",2,1,"standard","",36.54,33.8),
  P(60,"Whiskey","RNDC","Evan Williams","1L",4,1,"standard","",11.50,33.8),
  P(61,"Whiskey","RNDC","Jack Daniel's","1L",2,2,"standard","",30.18,33.8),
  P(62,"Whiskey","RNDC","Fireball","1L",1,1,"standard","",17.97,33.8),
  P(63,"Whiskey","Rolling Still","Ponderosa Whiskey","750ml",2,1),
  P(64,"Gin","Southern","Bombay Sapphire","1L",2,1,"standard","",39.59,33.8),
  P(65,"Gin","RNDC","New Amsterdam Gin","1L",4,1,"standard","",11.99,33.8),
  P(66,"Gin","RNDC","Empress Rose Gin","1L",2,0,"standard","",44.79,33.8),
  P(67,"Gin","RNDC","Tanqueray","1L",2,1,"standard","~$26.54 eff (buy 6 get 2)",26.54,33.8),
  P(68,"Gin","RNDC","Hendricks","1L",2,1,"standard","",39.95,33.8),
  P(69,"Rum","Southern","Captain Morgan","1L",2,0,"quarter_rule","Don't reorder until bar ≤ 0.25",26.99,33.8),
  P(70,"Rum","Southern","Myers Dark Rum","1L",2,0,"standard","",31.99,33.8),
  P(71,"Rum","Southern","Bacardi Light","1L",2,0,"standard","",27.59,33.8),
  P(72,"Rum","RNDC","Barton Light Rum","1L",4,1,"standard","",8.11,33.8),
  P(73,"Mezcal","RNDC","Mezcal 400 Conejos","750ml",2,3,"standard","",23.00,25.4),
  P(74,"Liqueurs","Southern","Jagermeister","1L",2,0,"standard","",33.59,33.8),
  P(75,"Liqueurs","Southern","Triple Sec","1L",4,1,"standard","~$10.07 eff (buy 4 get 1)",10.07,33.8),
  P(76,"Liqueurs","Southern","Grand Marnier","1L",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,33.8),
  P(77,"Liqueurs","Southern","Kahlua","1L",1,1,"standard","",29.00,33.8),
  P(78,"Liqueurs","Southern","M&R Vermouth Rosso","1L",1,1,"standard","",13.00,33.8),
  P(79,"Liqueurs","Southern","M&R Vermouth Dry","1L",1,1,"standard","",13.00,33.8),
  P(80,"Liqueurs","Southern","Aperol","1L",1,1,"standard","",31.00,33.8),
  P(81,"Liqueurs","Southern","Campari","1L",1,1,"standard","",45.99,33.8),
  P(82,"Liqueurs","Southern","St. Germain","750ml",1,0,"standard","",34.59,25.4),
  P(83,"Liqueurs","Southern","Luxardo Maraschino","750ml",1,0,"standard","",32.00,25.4),
  P(84,"Liqueurs","Southern","Blackberry Brandy","1L",1,0,"discontinue","Let it run out",0,33.8),
  P(85,"Liqueurs","Southern","Watermelon Schnapps","1L",1,0,"standard","Free w/promo",0,33.8),
  P(86,"Liqueurs","Southern","Blue Curacao","1L",1,0,"standard","Free w/deals",0,33.8),
  P(87,"Liqueurs","RNDC","Fernet Branca","750ml",2,2,"standard","",31.30,25.4),
  P(88,"Liqueurs","RNDC","Baileys","1L",1,1,"standard","",36.24,33.8),
  P(89,"Liqueurs","RNDC","Mr. Boston Amaretto","1L",1,2,"standard","",8.90,33.8),
  P(90,"Liqueurs","RNDC","Chambord","700ml",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",31.55,23.7),
  P(91,"Liqueurs","RNDC","Rumple Minze","1L",1,0,"standard","",32.24,33.8),
  P(92,"Liqueurs","RNDC","Southern Comfort","Bottles",0,0,"discontinue","Let it run out",0,25.4),
  P(93,"Liqueurs","RNDC","Peach Schnapps","750ml",1,2,"standard","",4.39,25.4),
  P(94,"Liqueurs","RNDC","Mr. Boston Peppermint","1L",1,1,"standard","",8.90,33.8),
  P(95,"Liqueurs","RNDC","Naranja Orange","1L",1,1,"standard","",22.04,33.8),
  P(96,"Mixers","RNDC","Santa Fe Margarita Mix","1L",4,2,"standard","",4.89,33.8),
  P(97,"Mixers","RNDC","Bloody Mary Mix","1L",1,1,"below_quarter","Reorder if storage ≤ 0.25",4.42,33.8),
  P(98,"Mixers","RNDC","Finest Call Grenadine","1L",2,1,"below_quarter","Reorder if storage ≤ 0.25",4.50,33.8),
  P(99,"Mixers","RNDC","Finest Call Lime Juice","1L",2,1,"below_half","Reorder if storage ≤ 0.5",6.00,33.8),
  P(100,"Mixers","RNDC","Finest Call Lemon Juice","1L",2,1,"discontinue","Let it run out",6.30,33.8),
  P(101,"Mixers","RNDC","Finest Call Strawberry","1L",1,3,"standard","",4.50,33.8),
  P(102,"Mixers","RNDC","Clamato Juice","1L",1,1,"below_quarter","Reorder if storage ≤ 0.25",4.42,33.8),
  P(103,"Seltzers","RNDC","High Noon Tequila Lime","355ml 24pk",13,1,"below_half","Reorder if storage ≤ 0.5",45.60,0),
  P(104,"Seltzers","RNDC","High Noon Pineapple","355ml 24pk",18,1,"below_half","Reorder if storage ≤ 0.5",45.60,0),
  P(105,"Kegs","Premier","La Cumbre Elevated IPA 1/2","1/2 Keg",3,0,"flexible","Par 2-3 (+$50 dep)",160.00,1984),
  P(106,"Kegs","Premier","La Cumbre Elevated IPA 1/6","1/6 Keg",2,0,"flexible","Par 1-2 (+$50 dep)",66.00,661),
  P(107,"Kegs","Premier","Other La Cumbre","Various",0,0,"flexible","Weekly deals"),
  P(108,"Kegs","Premier","Tractor Brewery","Various",0,0,"flexible","Weekly variety"),
  P(109,"Kegs","Admiral","Marble Cerveza 1/2","1/2 Keg",2,0,"standard","(+$30 dep)",160.00,1984),
  P(110,"Kegs","Admiral","Other Marble","Various",0,0,"flexible","Weekly deals"),
  P(111,"Kegs","Bow & Arrow","Variety - Peter Moore","Various",0,0,"flexible","1/6: $65-125, 1/2: $170-195 (+$30 dep)"),
  P(112,"Kegs","RNDC","New Belgium Fat Tire","1/2 or 1/6",1,0,"standard","1/2: $155, 1/6: $72",155.00,1984),
  P(113,"Fountain","Pepsi","Pepsi","BIB",1,1,"reorder_empty","Reorder when storage hits 0"),
  P(114,"Fountain","Pepsi","Diet Pepsi","BIB",1,1,"reorder_empty","Reorder when storage hits 0"),
  P(115,"Fountain","Pepsi","Sierra Mist / Starry","BIB",1,1,"reorder_empty","Reorder when storage hits 0"),
  P(116,"Fountain","Pepsi","Dr. Pepper","BIB",1,1,"reorder_empty","Reorder when storage hits 0"),
  P(117,"Fountain","Pepsi","Tonic","BIB",1,1,"reorder_empty","Reorder when storage hits 0"),
  P(118,"Fountain","Pepsi","Lemonade","BIB",1,1,"reorder_empty","Reorder when storage hits 0"),
  P(119,"CO2","Mathenson CO2","CO2 Tank","50lb Tank",1,2,"below_stor_par","Reorder when storage < 2. ~$37/tank + fees",37.31,0),
  P(120,"Supplies","Webstaurante","9oz Plastic Cups","Cases",0,1,"below_half","Reorder at ≤ 0.5"),
  P(121,"Supplies","Webstaurante","16oz Plastic Cups","Cases",0,1,"below_half","Reorder at ≤ 0.5"),
  P(122,"Supplies","Webstaurante","Water Cups","Cases",0,1,"below_half","Reorder at ≤ 0.5"),
  P(123,"Supplies","Webstaurante","Jumbo Straws","Boxes",0,2),
  P(124,"Supplies","Webstaurante","Stir Stick Straws","Cases",0,1),
  P(125,"Supplies","Webstaurante","Plastic Forks","Boxes",0,1,"below_half","Reorder at ≤ 0.5"),
  P(126,"Supplies","Webstaurante","Plastic Knives","Boxes",0,1,"below_half","Reorder at ≤ 0.5"),
  P(127,"Supplies","Webstaurante","Plastic Spoons","Boxes",0,1,"below_half","Reorder at ≤ 0.5"),
  P(128,"Supplies","Webstaurante","Dispenser Napkins","Boxes",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(129,"Supplies","Webstaurante","Beverage Napkins","Boxes",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(130,"Supplies","Webstaurante","Large To-Go Boxes","Boxes",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(131,"Supplies","Webstaurante","Small To-Go Boxes","Boxes",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(132,"Supplies","Webstaurante","To-Go Ramekins","Cases",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(133,"Supplies","Webstaurante","To-Go Ramekin Lids","Cases",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(134,"Supplies","Webstaurante","To-Go Plastic Bags","Cases",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(135,"Supplies","Webstaurante","Grapefruit Juice","Cases",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(136,"Supplies","Webstaurante","Cranberry Juice","Cases",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(137,"Supplies","Webstaurante","Pineapple Juice","Cases",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(138,"Supplies","Webstaurante","Coconut Puree","Cases",0,1,"below_quarter","Reorder at ≤ 0.25"),
  P(139,"Food Order","Shamrock","Prickly Pear Syrup","—",0,0,"chef_order","Tell chef Sunday"),
  P(140,"Food Order","Shamrock","Mint","—",0,0,"chef_order","Tell chef Sunday"),
  P(141,"Food Order","Shamrock","Watermelon","—",0,0,"chef_order","Tell chef Sunday"),
  P(142,"Bar Essentials","TBD","Angostura Bitters","Bottles",2,1,"below_quarter","Reorder if storage ≤ 0.25"),
  P(143,"Bar Essentials","TBD","Luxardo Cherries","Jars",1,2),
  P(144,"Bar Essentials","TBD","Tajin","Case",1,1,"below_quarter","Reorder if storage ≤ 0.25"),
];

function getStatus(p) {
  if (p.rule==="discontinue") return {level:"skip",label:"Discontinuing"};
  if (p.rule==="chef_order") return {level:"info",label:"Food order"};
  if (p.rule==="flexible") return {level:"info",label:"Flexible"};
  if (p.rule==="quarter_rule") {
    if (p.storPar>0) return p.storStock<p.storPar?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
    return p.barStock<=0.25?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  }
  if (p.rule==="below_threshold") return p.storStock<0.5?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if (p.rule==="below_quarter") return p.storStock<=0.25?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if (p.rule==="below_half") return p.storStock<=0.5?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if (p.rule==="always_full") return p.storStock<2?{level:"urgent",label:"URGENT"}:{level:"ok",label:"OK"};
  if (p.rule==="reorder_empty") return p.storStock<=0?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if (p.rule==="below_stor_par") return p.storStock<p.storPar?{level:"low",label:"ORDER"}:{level:"ok",label:"OK"};
  if (p.storPar===0&&p.barPar===0) return {level:"ok",label:"OK"};
  if (p.storPar===0) {
    if (p.barStock===0) return {level:"urgent",label:"OUT"};
    if (p.barStock<p.barPar*0.5) return {level:"low",label:"LOW"};
    if (p.barStock<p.barPar) return {level:"watch",label:"Watch"};
    return {level:"ok",label:"OK"};
  }
  const barShort=Math.max(0,p.barPar-p.barStock);const storAfter=p.storStock-barShort;
  if (p.storStock===0&&p.barStock===0) return {level:"urgent",label:"OUT"};
  if (p.storStock===0&&barShort>0) return {level:"urgent",label:"URGENT"};
  if (p.storStock<p.storPar*0.3) return {level:"urgent",label:"URGENT"};
  if (p.storStock<p.storPar) return {level:"low",label:"ORDER"};
  if (storAfter<p.storPar) return {level:"low",label:"ORDER"};
  return {level:"ok",label:"OK"};
}

const SC={urgent:{bg:"#FFE0E0",tx:"#991B1B",bd:"#F09595"},low:{bg:"#FFF3CD",tx:"#854F0B",bd:"#FAC775"},watch:{bg:"#FFF8DC",tx:"#633806",bd:"#EF9F27"},ok:{bg:"#D4EDDA",tx:"#085041",bd:"#5DCAA5"},skip:{bg:"#F1EFE8",tx:"#5F5E5A",bd:"#B4B2A9"},info:{bg:"#E6F1FB",tx:"#0C447C",bd:"#85B7EB"}};
const CATS=[...new Set(INIT.map(p=>p.cat))];
const getWeekId=()=>{const d=new Date();d.setDate(d.getDate()-d.getDay()+1);return d.toISOString().slice(0,10);};
const R=(n)=>Math.round(n*100)/100;

// Supabase storage helpers
async function dbLoad() {
  try {
    const {data,error}=await supabase.from("app_state").select("data").eq("id","main").single();
    if (error) throw error;
    return data?.data || {};
  } catch(e) { console.error("DB load error:",e); return {}; }
}
async function dbSave(state) {
  try {
    await supabase.from("app_state").upsert({id:"main",data:state,updated_at:new Date().toISOString()});
  } catch(e) { console.error("DB save error:",e); }
}

export default function App() {
  const [auth,setAuth]=useState(false);const [pw,setPw]=useState("");const [pwErr,setPwErr]=useState(false);
  const [products,setProducts]=useState(INIT);
  const [snapshots,setSnapshots]=useState([]);const [orderLog,setOrderLog]=useState([]);
  const [recipes,setRecipes]=useState([]);const [pourCostLog,setPourCostLog]=useState([]);const [varianceLog,setVarianceLog]=useState([]);
  const [view,setView]=useState("dashboard");const [filter,setFilter]=useState("all");const [supFilter,setSupFilter]=useState("all");
  const [catFilter,setCatFilter]=useState("all");const [search,setSearch]=useState("");
  const [editId,setEditId]=useState(null);const [editBar,setEditBar]=useState("");const [editStor,setEditStor]=useState("");const [editCost,setEditCost]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [orderSup,setOrderSup]=useState("");const [orderItems,setOrderItems]=useState("");const [orderNote,setOrderNote]=useState("");
  const [rName,setRName]=useState("");const [rIng,setRIng]=useState([{pid:"",oz:""}]);const [rPrice,setRPrice]=useState("");const [rEditId,setREditId]=useState(null);
  const [pcB,setPcB]=useState("");const [pcP,setPcP]=useState("");const [pcE,setPcE]=useState("");const [pcS,setPcS]=useState("");
  const [dpC,setDpC]=useState("");const [dpB,setDpB]=useState("33.8");const [dpP,setDpP]=useState("1.5");const [dpT,setDpT]=useState("20");
  const [vProd,setVProd]=useState("");const [vExp,setVExp]=useState("");const [vAct,setVAct]=useState("");const [vN,setVN]=useState("");
  const [finTab,setFinTab]=useState("pour");const [saving,setSaving]=useState(false);

  const load=useCallback(async()=>{
    const d=await dbLoad();
    if (d.products) setProducts(d.products);
    if (d.snapshots) setSnapshots(d.snapshots);
    if (d.orderLog) setOrderLog(d.orderLog);
    if (d.recipes) setRecipes(d.recipes);
    if (d.pourCostLog) setPourCostLog(d.pourCostLog);
    if (d.varianceLog) setVarianceLog(d.varianceLog);
    setLoaded(true);
  },[]);

  useEffect(()=>{if(auth)load();},[auth,load]);

  const save=useCallback(async(p,s,o,r,pc,v)=>{
    setSaving(true);
    await dbSave({products:p||products,snapshots:s||snapshots,orderLog:o||orderLog,recipes:r||recipes,pourCostLog:pc||pourCostLog,varianceLog:v||varianceLog,ts:new Date().toISOString()});
    setSaving(false);
  },[products,snapshots,orderLog,recipes,pourCostLog,varianceLog]);

  const updateProduct=(id)=>{
    const np=products.map(p=>p.id===id?{...p,barStock:parseFloat(editBar)||0,storStock:parseFloat(editStor)||0,cost:parseFloat(editCost)||p.cost}:p);
    setProducts(np);const wk=getWeekId();
    const snap={week:wk,date:new Date().toISOString(),items:np.map(p=>({id:p.id,bar:p.barStock,stor:p.storStock}))};
    let ns=[...snapshots];const idx=ns.findIndex(s=>s.week===wk);if(idx>=0)ns[idx]=snap;else ns.push(snap);if(ns.length>52)ns=ns.slice(-52);
    setSnapshots(ns);save(np,ns);setEditId(null);setEditCost("");
  };

  const logOrder=()=>{if(!orderSup||!orderItems)return;const nl=[...orderLog,{id:Date.now(),date:new Date().toISOString(),supplier:orderSup,items:orderItems,note:orderNote}];setOrderLog(nl);save(null,null,nl);setOrderSup("");setOrderItems("");setOrderNote("");};
  const saveRecipe=()=>{if(!rName)return;const vi=rIng.filter(i=>i.pid&&i.oz);const rec={id:rEditId||Date.now(),name:rName,ingredients:vi,menuPrice:parseFloat(rPrice)||0};const nr=rEditId?recipes.map(r=>r.id===rEditId?rec:r):[...recipes,rec];setRecipes(nr);save(null,null,null,nr);setRName("");setRIng([{pid:"",oz:""}]);setRPrice("");setREditId(null);};
  const recipeCost=(rec)=>{let t=0;rec.ingredients.forEach(i=>{const p=products.find(x=>x.id===parseInt(i.pid));if(p&&p.cost>0&&p.ozPerBottle>0)t+=(p.cost/p.ozPerBottle)*parseFloat(i.oz);});return t;};
  const savePourCost=()=>{const b=parseFloat(pcB)||0,p=parseFloat(pcP)||0,e=parseFloat(pcE)||0,s=parseFloat(pcS)||0;if(!s)return;const cogs=b+p-e;const nl=[...pourCostLog,{id:Date.now(),date:new Date().toISOString(),begin:b,purchases:p,end:e,sales:s,cogs,pourCost:R((cogs/s)*100)}];setPourCostLog(nl);save(null,null,null,null,nl);setPcB("");setPcP("");setPcE("");setPcS("");};
  const saveVariance=()=>{if(!vProd)return;const exp=parseFloat(vExp)||0;const act=parseFloat(vAct)||0;const nl=[...varianceLog,{id:Date.now(),date:new Date().toISOString(),productId:parseInt(vProd),expected:exp,actual:act,variance:R(act-exp),note:vN}];setVarianceLog(nl);save(null,null,null,null,null,nl);setVProd("");setVExp("");setVAct("");setVN("");};
  const getUsage=(pid)=>{if(snapshots.length<2)return [];const sorted=[...snapshots].sort((a,b)=>a.week.localeCompare(b.week));const u=[];for(let i=1;i<sorted.length;i++){const prev=sorted[i-1].items.find(x=>x.id===pid);const curr=sorted[i].items.find(x=>x.id===pid);if(prev&&curr)u.push({week:sorted[i].week,used:Math.max(0,(prev.bar+prev.stor)-(curr.bar+curr.stor))});}return u;};

  const stats=useMemo(()=>{let u=0,l=0,o=0;products.forEach(p=>{const s=getStatus(p);if(s.level==="urgent")u++;else if(["low","watch"].includes(s.level))l++;else if(s.level==="ok")o++;});return {u,l,o};},[products]);
  const totalVal=useMemo(()=>products.reduce((t,p)=>t+(p.cost*(p.barStock+p.storStock)),0),[products]);
  const filtered=useMemo(()=>{let f=[...products];if(filter==="urgent")f=f.filter(p=>getStatus(p).level==="urgent");else if(filter==="low")f=f.filter(p=>["low","watch"].includes(getStatus(p).level));else if(filter==="ok")f=f.filter(p=>getStatus(p).level==="ok");if(supFilter!=="all")f=f.filter(p=>p.supplier===supFilter);if(catFilter!=="all")f=f.filter(p=>p.cat===catFilter);if(search)f=f.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));return f;},[products,filter,supFilter,catFilter,search]);
  const supGroups=useMemo(()=>{const g={};products.forEach(p=>{const s=getStatus(p);if(["urgent","low","watch"].includes(s.level)){if(!g[p.supplier])g[p.supplier]=[];g[p.supplier].push({...p,status:s});}});return g;},[products]);
  const spirits=products.filter(p=>["Tequila","Vodka","Whiskey","Gin","Rum","Mezcal","Liqueurs","Wine","Mixers"].includes(p.cat));
  const dayN=new Date().getDay();const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const deadlines=[...(dayN===0?[{s:"Shamrock",n:"Remind chef — food"}]:[]),...(dayN===1?[{s:"Shamrock",n:"ORDER — Before 5pm"},{s:"Southern",n:"Start (due Tue 3pm)"},{s:"Premier",n:"Start (due Wed noon)"},{s:"Admiral",n:"Start (due Wed 3pm)"},{s:"Fiasco",n:"Start (due Tue 3pm)"}]:[]),...(dayN===2?[{s:"Southern",n:"LAST DAY — 3pm"},{s:"Fiasco",n:"LAST DAY — 3pm"},{s:"RNDC",n:"Biweekly — 3pm"},{s:"Pepsi",n:"Before 2pm"},{s:"Shamrock",n:"DELIVERY"},{s:"Pepsi",n:"DELIVERY"}]:[]),...(dayN===3?[{s:"Premier",n:"LAST DAY — Noon"},{s:"Admiral",n:"LAST DAY — 3pm"}]:[]),...(dayN===4?[{s:"Southern",n:"DELIVERY"},{s:"Premier",n:"DELIVERY"},{s:"Fiasco",n:"DELIVERY"},{s:"RNDC",n:"DELIVERY"}]:[]),...(dayN===5?[{s:"Admiral",n:"DELIVERY"}]:[])];
  const dpSug=useMemo(()=>{const c=parseFloat(dpC)||0,bo=parseFloat(dpB)||1,po=parseFloat(dpP)||1,t=parseFloat(dpT)||20;if(!c)return 0;return R((c/bo*po)/(t/100));},[dpC,dpB,dpP,dpT]);

  const S={
    wrap:{fontFamily:"system-ui,-apple-system,sans-serif",maxWidth:800,margin:"0 auto",padding:"0 12px 80px"},
    nav:{display:"flex",gap:3,padding:"10px 0",borderBottom:"1px solid #e0e0e0",marginBottom:14,flexWrap:"wrap",position:"sticky",top:0,background:"#fff",zIndex:10},
    nb:a=>({padding:"6px 10px",borderRadius:8,border:"none",fontSize:11,fontWeight:500,cursor:"pointer",background:a?"#1B2A4A":"#f0f0f0",color:a?"#fff":"#333"}),
    card:{background:"#fff",borderRadius:10,border:"1px solid #e8e8e8",padding:14,marginBottom:10},
    badge:l=>({display:"inline-block",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:SC[l]?.bg||"#eee",color:SC[l]?.tx||"#333",border:`1px solid ${SC[l]?.bd||"#ccc"}`}),
    inp:{width:60,padding:"6px",borderRadius:6,border:"1px solid #ccc",fontSize:14,textAlign:"center"},
    inpF:{width:"100%",padding:"8px",borderRadius:6,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"},
    supH:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#1B2A4A",color:"#fff",borderRadius:"10px 10px 0 0"},
    stat:c=>({flex:1,minWidth:65,padding:"10px 4px",borderRadius:10,textAlign:"center",background:c.bg,border:`1px solid ${c.bd}`,cursor:"pointer"}),
    sel:{padding:"6px 10px",borderRadius:6,border:"1px solid #ccc",fontSize:12},
    btn:{padding:"8px 16px",borderRadius:6,border:"none",background:"#1B2A4A",color:"#fff",fontSize:13,cursor:"pointer"},
    btnO:{padding:"8px 14px",borderRadius:6,border:"1px solid #ccc",background:"#fff",fontSize:12,cursor:"pointer"},
    lbl:{fontSize:11,color:"#888",marginBottom:2},
    ft:a=>({padding:"6px 12px",borderRadius:6,border:"none",fontSize:11,fontWeight:500,cursor:"pointer",background:a?"#2E5090":"#e8e8e8",color:a?"#fff":"#333"}),
  };

  if (!auth) return (
    <div style={{...S.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <div style={{fontSize:22,fontWeight:600,color:"#1B2A4A",marginBottom:4}}>Bar ordering system</div>
      <p style={{color:"#888",fontSize:13,marginBottom:20}}>Enter password to continue</p>
      <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwErr(false);}} onKeyDown={e=>{if(e.key==="Enter"){if(pw===PASSWORD)setAuth(true);else setPwErr(true);}}} placeholder="Password" style={{padding:"10px 16px",borderRadius:8,border:`1px solid ${pwErr?"#e24b4a":"#ccc"}`,fontSize:16,width:220,textAlign:"center",marginBottom:10}} autoFocus/>
      <button onClick={()=>{if(pw===PASSWORD)setAuth(true);else setPwErr(true);}} style={S.btn}>Enter</button>
      {pwErr&&<p style={{color:"#e24b4a",fontSize:13,marginTop:8}}>Incorrect password</p>}
    </div>
  );

  if (!loaded) return <div style={S.wrap}><p style={{textAlign:"center",padding:40,color:"#888"}}>Loading from database...</p></div>;

  return (<div style={S.wrap}>
    <div style={{padding:"14px 0 6px",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
      <div><h1 style={{margin:0,fontSize:20,fontWeight:600,color:"#1B2A4A"}}>Bar ordering system</h1>
      <p style={{margin:"2px 0 0",fontSize:12,color:"#888"}}>{days[dayN]}{totalVal>0?` · $${Math.round(totalVal).toLocaleString()}`:""} · {products.filter(p=>p.cost>0).length} costed{saving?" · Saving...":""}</p></div>
      <button onClick={()=>setAuth(false)} style={{fontSize:11,color:"#999",background:"none",border:"none",cursor:"pointer"}}>Lock</button>
    </div>

    <div style={S.nav}>
      {[["dashboard","Home"],["inventory","Inventory"],["orders","Orders"],["recipes","Recipes"],["finance","Finance"],["log","Log"],["history","History"],["suppliers","Contacts"]].map(([v,l])=> <button key={v} style={S.nb(view===v)} onClick={()=>setView(v)}>{l}</button>)}
    </div>

    {view==="dashboard"&&<>
      {deadlines.length>0&&<div style={{...S.card,background:"#FFFBEB",borderColor:"#FAC775"}}><div style={{fontSize:13,fontWeight:600,color:"#854F0B",marginBottom:6}}>Today</div>{deadlines.map((d,i)=> <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12}}><span style={{fontWeight:500}}>{d.s}</span><span style={{color:d.n.includes("DELIVERY")?"#006600":d.n.includes("LAST")?"#CC0000":"#555"}}>{d.n}</span></div>)}</div>}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        <div style={S.stat(SC.urgent)} onClick={()=>{setView("inventory");setFilter("urgent");}}><div style={{fontSize:22,fontWeight:600,color:SC.urgent.tx}}>{stats.u}</div><div style={{fontSize:10,color:SC.urgent.tx}}>Urgent</div></div>
        <div style={S.stat(SC.low)} onClick={()=>{setView("inventory");setFilter("low");}}><div style={{fontSize:22,fontWeight:600,color:SC.low.tx}}>{stats.l}</div><div style={{fontSize:10,color:SC.low.tx}}>Low</div></div>
        <div style={S.stat(SC.ok)} onClick={()=>{setView("inventory");setFilter("ok");}}><div style={{fontSize:22,fontWeight:600,color:SC.ok.tx}}>{stats.o}</div><div style={{fontSize:10,color:SC.ok.tx}}>Good</div></div>
      </div>
      {pourCostLog.length>0&&<div style={{...S.card,background:"#f0f4ff"}}><div style={{fontSize:13,fontWeight:600,color:"#1B2A4A"}}>Pour cost</div><div style={{fontSize:28,fontWeight:600,color:pourCostLog[pourCostLog.length-1].pourCost>25?"#c00":"#060"}}>{pourCostLog[pourCostLog.length-1].pourCost}%</div></div>}
      <div style={S.card}><div style={{fontSize:13,fontWeight:600,marginBottom:8,color:"#1B2A4A"}}>Needs attention</div>
        {products.filter(p=>["urgent","low","watch"].includes(getStatus(p).level)).slice(0,12).map(p=>{const s=getStatus(p);return <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f0f0f0"}}><div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.supplier}</div></div><span style={S.badge(s.level)}>{s.label}</span></div>;})}
      </div>
    </>}

    {view==="inventory"&&<>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>{[["all","All"],["urgent","Urgent"],["low","Low"],["ok","Good"]].map(([f,l])=> <button key={f} style={{...S.nb(filter===f),fontSize:11,padding:"5px 10px"}} onClick={()=>setFilter(f)}>{l}</button>)}</div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={S.sel}><option value="all">All categories</option>{CATS.map(c=> <option key={c} value={c}>{c}</option>)}</select>
        <select value={supFilter} onChange={e=>setSupFilter(e.target.value)} style={S.sel}><option value="all">All suppliers</option>{Object.keys(SUPPLIERS).map(s=> <option key={s} value={s}>{s}</option>)}</select>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:100,padding:"6px 10px",borderRadius:6,border:"1px solid #ccc",fontSize:12}}/>
      </div>
      <div style={{fontSize:11,color:"#888",marginBottom:6}}>{filtered.length} items</div>
      {filtered.map(p=>{const s=getStatus(p);const ed=editId===p.id;const usage=getUsage(p.id);const avg=usage.length>0?R(usage.reduce((a,u)=>a+u.used,0)/usage.length):null;
        return <div key={p.id} style={{...S.card,padding:10,borderLeftColor:SC[s.level]?.bd||"#ccc",borderLeftWidth:3,borderLeftStyle:"solid"}} onClick={()=>{if(!ed){setEditId(p.id);setEditBar(String(p.barStock));setEditStor(String(p.storStock));setEditCost(String(p.cost||""));}}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.supplier} · {p.size}{p.cost>0?` · $${p.cost}`:""}</div>{p.ruleNote&&<div style={{fontSize:10,color:"#b45309",marginTop:1}}>{p.ruleNote}</div>}{avg!==null&&<div style={{fontSize:10,color:"#6b7280",marginTop:1}}>Avg: {avg}/wk</div>}</div>
            <div style={{textAlign:"right"}}><span style={S.badge(s.level)}>{s.label}</span>{!ed&&<div style={{fontSize:10,color:"#888",marginTop:2}}>B:{p.barStock}/{p.barPar} S:{p.storStock}/{p.storPar}</div>}</div>
          </div>
          {ed&&<div style={{marginTop:8,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
            <div><div style={S.lbl}>Bar (par:{p.barPar})</div><input value={editBar} onChange={e=>setEditBar(e.target.value)} style={S.inp} autoFocus/></div>
            <div><div style={S.lbl}>Storage (par:{p.storPar})</div><input value={editStor} onChange={e=>setEditStor(e.target.value)} style={S.inp}/></div>
            <div><div style={S.lbl}>Cost ($)</div><input value={editCost} onChange={e=>setEditCost(e.target.value)} style={{...S.inp,width:70}}/></div>
            <button onClick={()=>updateProduct(p.id)} style={{...S.btn,marginTop:12}}>Save</button>
            <button onClick={e=>{e.stopPropagation();setEditId(null);}} style={{...S.btnO,marginTop:12}}>Cancel</button>
          </div>}
        </div>;})}
    </>}

    {view==="orders"&&<>
      {Object.entries(supGroups).sort(([,a],[,b])=>b.filter(x=>x.status.level==="urgent").length-a.filter(x=>x.status.level==="urgent").length).map(([sup,items])=>{const info=SUPPLIERS[sup];return <div key={sup} style={{marginBottom:14,borderRadius:10,overflow:"hidden",border:"1px solid #e0e0e0"}}>
        <div style={S.supH}><div><div style={{fontSize:14,fontWeight:600}}>{sup}</div><div style={{fontSize:10,opacity:0.8}}>By: {info?.deadline||"—"} · Del: {info?.delivery||"—"}</div></div><div style={{background:"#fff",color:"#1B2A4A",borderRadius:12,padding:"2px 8px",fontSize:11,fontWeight:600}}>{items.length}</div></div>
        {items.map(p=> <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",borderBottom:"1px solid #f0f0f0",background:SC[p.status.level]?.bg}}><div><div style={{fontSize:12,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.size} · B:{p.barStock}/{p.barPar} · S:{p.storStock}/{p.storPar}</div></div><span style={S.badge(p.status.level)}>{p.status.label}</span></div>)}
        {info?.phone&&<div style={{padding:"6px 14px",fontSize:11,color:"#555",background:"#fafafa"}}>Call: {info.phone}{info.contact?` (${info.contact})`:""}</div>}
      </div>;})}
      {Object.keys(supGroups).length===0&&<div style={{...S.card,textAlign:"center",color:"#888"}}>Everything's at par!</div>}
    </>}

    {view==="recipes"&&<>
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:10}}>{rEditId?"Edit":"New"} recipe</div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Drink name</div><input value={rName} onChange={e=>setRName(e.target.value)} style={S.inpF}/></div>
        <div style={S.lbl}>Ingredients</div>
        {rIng.map((ing,i)=> <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
          <select value={ing.pid} onChange={e=>{const n=[...rIng];n[i].pid=e.target.value;setRIng(n);}} style={{...S.sel,flex:1}}>
            <option value="">Select</option>{spirits.map(p=> <option key={p.id} value={p.id}>{p.name}{p.cost?` ($${p.cost})`:""}</option>)}
          </select>
          <input value={ing.oz} onChange={e=>{const n=[...rIng];n[i].oz=e.target.value;setRIng(n);}} style={{...S.inp,width:45}} placeholder="oz"/>
          <span style={{fontSize:11,color:"#888"}}>oz</span>
          {rIng.length>1&&<button onClick={()=>setRIng(rIng.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#c00",cursor:"pointer"}}>×</button>}
        </div>)}
        <button onClick={()=>setRIng([...rIng,{pid:"",oz:""}])} style={{...S.btnO,fontSize:11,marginBottom:10}}>+ ingredient</button>
        <div style={{marginBottom:8}}><div style={S.lbl}>Menu price ($)</div><input value={rPrice} onChange={e=>setRPrice(e.target.value)} style={{...S.inp,width:80}}/></div>
        <button onClick={saveRecipe} style={S.btn}>{rEditId?"Update":"Save"}</button>
      </div>
      {recipes.map(r=>{const cost=recipeCost(r);const pour=r.menuPrice>0?R((cost/r.menuPrice)*100):0;
        return <div key={r.id} style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600}}>{r.name}</div>
              {r.ingredients.map((ing,i)=>{const p=products.find(x=>x.id===parseInt(ing.pid));const ic=p&&p.cost&&p.ozPerBottle?R(p.cost/p.ozPerBottle*parseFloat(ing.oz)):0;return <div key={i} style={{fontSize:11,color:"#555"}}>{ing.oz}oz {p?.name||"?"}{ic?` ($${ic.toFixed(2)})`:""}</div>;})}
            </div>
            <div style={{textAlign:"right"}}>{cost>0&&<div style={{fontSize:18,fontWeight:600}}>${cost.toFixed(2)}</div>}{r.menuPrice>0&&<div style={{fontSize:12,color:"#888"}}>${r.menuPrice} menu</div>}{pour>0&&<div style={{fontSize:13,fontWeight:600,color:pour>25?"#c00":"#060"}}>{pour}%</div>}</div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}><button onClick={()=>{setREditId(r.id);setRName(r.name);setRIng(r.ingredients.length?r.ingredients:[{pid:"",oz:""}]);setRPrice(String(r.menuPrice||""));}} style={S.btnO}>Edit</button><button onClick={()=>{const nr=recipes.filter(x=>x.id!==r.id);setRecipes(nr);save(null,null,null,nr);}} style={{...S.btnO,color:"#c00"}}>Delete</button></div>
        </div>;})}
    </>}

    {view==="finance"&&<>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>{[["pour","Pour cost"],["pricing","Pricing"],["variance","Variance"],["value","Value"]].map(([t,l])=> <button key={t} style={S.ft(finTab===t)} onClick={()=>setFinTab(t)}>{l}</button>)}</div>
      {finTab==="pour"&&<><div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:10}}>Pour cost</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div><div style={S.lbl}>Beginning inv ($)</div><input value={pcB} onChange={e=>setPcB(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Purchases ($)</div><input value={pcP} onChange={e=>setPcP(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Ending inv ($)</div><input value={pcE} onChange={e=>setPcE(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Total sales ($)</div><input value={pcS} onChange={e=>setPcS(e.target.value)} style={S.inpF}/></div>
        </div>
        {pcS&&parseFloat(pcS)>0&&<div style={{background:"#f0f4ff",borderRadius:8,padding:12,marginBottom:10}}><div style={{fontSize:28,fontWeight:600,color:R(((parseFloat(pcB)||0)+(parseFloat(pcP)||0)-(parseFloat(pcE)||0))/(parseFloat(pcS)||1)*100)>25?"#c00":"#060"}}>{R(((parseFloat(pcB)||0)+(parseFloat(pcP)||0)-(parseFloat(pcE)||0))/(parseFloat(pcS)||1)*100)}%</div></div>}
        <button onClick={savePourCost} style={S.btn}>Save</button>
      </div>
      {pourCostLog.length>0&&[...pourCostLog].reverse().slice(0,10).map(e=> <div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><span>{new Date(e.date).toLocaleDateString()}</span><span>Sales: ${e.sales.toLocaleString()}</span><span style={{fontWeight:600,color:e.pourCost>25?"#c00":"#060"}}>{e.pourCost}%</span></div>)}</>}
      {finTab==="pricing"&&<div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:10}}>Drink pricing</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div><div style={S.lbl}>Bottle cost ($)</div><input value={dpC} onChange={e=>setDpC(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Bottle oz</div><input value={dpB} onChange={e=>setDpB(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Pour oz</div><input value={dpP} onChange={e=>setDpP(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Target %</div><input value={dpT} onChange={e=>setDpT(e.target.value)} style={S.inpF}/></div>
        </div>
        {dpC&&<div style={{background:"#f0f4ff",borderRadius:8,padding:12}}><div style={{fontSize:11,color:"#888"}}>Cost/drink: ${R((parseFloat(dpC)||0)/(parseFloat(dpB)||1)*(parseFloat(dpP)||1)).toFixed(2)} · {Math.floor((parseFloat(dpB)||1)/(parseFloat(dpP)||1))} drinks/btl</div><div style={{fontSize:28,fontWeight:600,color:"#1B2A4A"}}>Charge: ${dpSug.toFixed(2)}</div></div>}
      </div>}
      {finTab==="variance"&&<><div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:10}}>Variance</div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Product</div><select value={vProd} onChange={e=>setVProd(e.target.value)} style={{...S.sel,width:"100%"}}><option value="">Select</option>{spirits.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={S.lbl}>Expected</div><input value={vExp} onChange={e=>setVExp(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Actual</div><input value={vAct} onChange={e=>setVAct(e.target.value)} style={S.inpF}/></div>
        </div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Notes</div><input value={vN} onChange={e=>setVN(e.target.value)} style={S.inpF}/></div>
        <button onClick={saveVariance} style={S.btn}>Log</button>
      </div>
      {varianceLog.length>0&&[...varianceLog].reverse().slice(0,10).map(e=>{const p=products.find(x=>x.id===e.productId);return <div key={e.id} style={{...S.card,padding:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:500}}>{p?.name||"?"}</span><span style={{fontSize:11,color:"#888"}}>{new Date(e.date).toLocaleDateString()}</span></div><div style={{fontSize:12}}>Exp:{e.expected} Act:{e.actual} <span style={{fontWeight:600,color:Math.abs(e.variance)>(e.expected*0.05)?"#c00":"#060"}}>Var:{e.variance>0?"+":""}{e.variance}</span></div></div>;})}</>}
      {finTab==="value"&&<>
        <div style={{...S.card,background:"#f0f4ff"}}><div style={{fontSize:13,fontWeight:600}}>Total value</div><div style={{fontSize:32,fontWeight:600,color:"#1B2A4A"}}>${Math.round(totalVal).toLocaleString()}</div><div style={{fontSize:11,color:"#888"}}>{products.filter(p=>p.cost>0).length}/{products.length} costed</div></div>
        {products.filter(p=>p.cost>0).sort((a,b)=>(b.cost*(b.barStock+b.storStock))-(a.cost*(a.barStock+a.storStock))).slice(0,20).map(p=> <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><span>{p.name}</span><span style={{fontWeight:600}}>${Math.round(p.cost*(p.barStock+p.storStock))}</span></div>)}
      </>}
    </>}

    {view==="log"&&<><div style={S.card}>
      <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:10}}>Log order</div>
      <div style={{marginBottom:8}}><div style={S.lbl}>Supplier</div><select value={orderSup} onChange={e=>setOrderSup(e.target.value)} style={{...S.sel,width:"100%"}}><option value="">Select</option>{Object.keys(SUPPLIERS).filter(s=>s!=="TBD").map(s=> <option key={s} value={s}>{s}</option>)}</select></div>
      <div style={{marginBottom:8}}><div style={S.lbl}>Items</div><textarea value={orderItems} onChange={e=>setOrderItems(e.target.value)} rows={3} style={{...S.inpF,resize:"vertical"}}/></div>
      <div style={{marginBottom:10}}><div style={S.lbl}>Notes</div><input value={orderNote} onChange={e=>setOrderNote(e.target.value)} style={S.inpF}/></div>
      <button onClick={logOrder} style={S.btn}>Save</button>
    </div>
    {orderLog.slice(-15).reverse().map(o=> <div key={o.id} style={{...S.card,padding:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:500}}>{o.supplier}</span><span style={{fontSize:11,color:"#888"}}>{new Date(o.date).toLocaleDateString()}</span></div><div style={{fontSize:12}}>{o.items}</div></div>)}</>}

    {view==="history"&&<>
      <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:10}}>Usage</div>
      {snapshots.length<2?<p style={{fontSize:12,color:"#888"}}>Need 2+ snapshots.</p>:<>
        {(()=>{const um={};products.forEach(p=>{const u=getUsage(p.id);if(u.length>0){const avg=u.reduce((a,x)=>a+x.used,0)/u.length;if(avg>0)um[p.id]={name:p.name,supplier:p.supplier,avg:R(avg)};}});return Object.values(um).sort((a,b)=>b.avg-a.avg).slice(0,20).map((item,i)=> <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><span>{item.name} <span style={{color:"#888"}}>({item.supplier})</span></span><span style={{fontWeight:500}}>{item.avg}/wk</span></div>);})()}
      </>}
      <div style={{fontSize:13,fontWeight:500,margin:"16px 0 8px"}}>Snapshots ({snapshots.length})</div>
      {[...snapshots].reverse().slice(0,12).map((snap,i)=> <div key={i} style={{...S.card,padding:10}}><span style={{fontSize:13,fontWeight:500}}>Week of {snap.week}</span> <span style={{fontSize:11,color:"#888"}}>{new Date(snap.date).toLocaleString()}</span></div>)}
    </>}

    {view==="suppliers"&&Object.entries(SUPPLIERS).filter(([n])=>n!=="TBD").map(([name,info])=> <div key={name} style={{...S.card,padding:12}}><div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:4}}>{name}</div><div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"3px 10px",fontSize:12}}><span style={{color:"#888"}}>Window:</span><span>{info.window}</span><span style={{color:"#888"}}>Deadline:</span><span>{info.deadline}</span><span style={{color:"#888"}}>Delivery:</span><span>{info.delivery}</span>{info.contact&&<><span style={{color:"#888"}}>Contact:</span><span>{info.contact}</span></>}{info.phone&&<><span style={{color:"#888"}}>Phone:</span><span>{info.phone}</span></>}{info.portal&&<><span style={{color:"#888"}}>Portal:</span><span style={{color:"#2563EB",wordBreak:"break-all"}}>{info.portal}</span></>}</div></div>)}

    <div style={{padding:"16px 0",textAlign:"center"}}><button onClick={()=>{if(window.confirm("Reset ALL data?")){setProducts(INIT);setSnapshots([]);setOrderLog([]);setRecipes([]);setPourCostLog([]);setVarianceLog([]);save(INIT,[],[],[],[],[]);}}} style={{fontSize:11,color:"#999",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Reset everything</button></div>
  </div>);
}
