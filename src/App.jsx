import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
);

const PASSWORD = "DaleeeOrders";

// Supplier data - loaded from DB if edited, otherwise defaults
const DEFAULT_SUP = {
  Premier:{dl:"Before Noon Wed",del:"Thursday",ct:"Aaron Montoya",ph:"505-614-5656",url:"https://mybeesapp.com/customer/account",win:"Mon–Wed",schedule:"weekly"},
  Admiral:{dl:"Before 3pm Wed",del:"Friday",ct:"Michael Martinez",ph:"(575) 770-6592",url:"https://apps.vtinfo.com/retailer-portal/00785/retailer/S1774",win:"Mon–Wed",schedule:"weekly"},
  Southern:{dl:"Before 3pm Tue",del:"Thursday",ct:"Sydnie",ph:"(505) 458-1627",url:"https://shop.sgproof.com",win:"Mon–Tue",schedule:"weekly"},
  RNDC:{dl:"Before 3pm (biweekly)",del:"Thursday",ct:"Jim",ph:"(575) 779-4745",url:"https://app.erndc.com/login",win:"Mon/Tue biweekly",schedule:"weekly"},
  Fiasco:{dl:"Before 3pm Tue",del:"Thursday",ct:"NOVA",ph:"575-7794440",url:"",win:"Mon–Tue",schedule:"weekly"},
  "Rolling Still":{dl:"Coordinate w/ Dan",del:"Coordinate",ct:"Dan",ph:"575-779-7977",url:"",win:"As needed",schedule:"anytime"},
  "Bow & Arrow":{dl:"Contact Peter Moore",del:"Every 2 weeks",ct:"Peter Moore",ph:"",url:"",win:"Biweekly",schedule:"weekly"},
  Pepsi:{dl:"Before 2pm Tue",del:"Tuesday",ct:"Kevin",ph:"505-595-5858",url:"https://www.pepsicopartners.com/",win:"Before Tue",schedule:"separate"},
  Shamrock:{dl:"Before 5pm Mon",del:"Tuesday",ct:"",ph:"",url:"https://shamrockorders.com/Catalog?svn=05",win:"Monday",schedule:"separate"},
  Webstaurante:{dl:"None",del:"Varies",ct:"",ph:"",url:"webstaurantstore.com",win:"As needed",schedule:"anytime"},
  "Mathenson CO2":{dl:"Check timing",del:"Mon or Tue",ct:"",ph:"505-982-1997",url:"",win:"As needed",schedule:"anytime"},
};

// mk(id, cat, supplier, name, size, unit, barPar, storPar, rule, ruleNote, cost, oz, barPos, storCat, disc)
const mk=(id,c,s,n,sz,u,bp,sp,r,rn,co,oz,bpos,scat)=>({id,cat:c,supplier:s,name:n,size:sz,unit:u||"btl",barPar:bp,barStock:bp,storPar:sp,storStock:sp,rule:r||"standard",ruleNote:rn||"",cost:co||0,ozPerBottle:oz||0,barPos:bpos||999,storCat:scat||c,notes:"",disc:false});

const INIT=[
  // === BAR SHELF ORDER (positions 1-117) ===
  // Shelf 1 - Spirits
  mk(1,"Rum","Southern","Myers Dark Rum","1L","btl",2,0,"standard","",31.99,33.8,1,"Rum"),
  mk(2,"Rum","Southern","Captain Morgan","1L","btl",2,0,"quarter_rule","Don't reorder until bar ≤ 0.25. OOS til ~4/20",26.99,33.8,2,"Rum"),
  mk(3,"Rum","Southern","Bacardi Light","1L","btl",2,0,"standard","",27.59,33.8,3,"Rum"),
  mk(4,"Whiskey","RNDC","Jameson","1L","btl",2,6,"standard","",36.54,33.8,4,"Whiskey"),
  mk(5,"Whiskey","Southern","Jim Beam","1L","btl",2,12,"standard","",22.19,33.8,5,"Whiskey"),
  mk(6,"Whiskey","Rolling Still","Ponderosa Whiskey","750ml","btl",2,6,"standard","",0,25.4,6,"Whiskey"),
  mk(7,"Whiskey","Southern","Chivas Regal 12yr","1L","btl",2,0,"standard","",39.00,33.8,7,"Whiskey"),
  mk(8,"Whiskey","Southern","Maker's Mark","1L","btl",2,6,"standard","~$31.67 eff (buy 4 get 1)",31.67,33.8,8,"Whiskey"),
  mk(9,"Whiskey","RNDC","Jack Daniel's","1L","btl",2,12,"standard","",30.18,33.8,9,"Whiskey"),
  mk(10,"Whiskey","Southern","Bulleit Rye","1L","btl",2,6,"standard","~$18.80 eff (buy 1 get 1)",18.80,33.8,10,"Whiskey"),
  mk(11,"Whiskey","Southern","Crown Royal","750ml","btl",2,6,"standard","",31.09,25.4,11,"Whiskey"),
  mk(12,"Whiskey","Southern","Crown Royal Peach","750ml","btl",2,6,"standard","",30.99,25.4,12,"Whiskey"),
  mk(13,"Whiskey","Southern","Crown Royal Apple","1L","btl",2,6,"standard","$45.99 list, cheaper w/ MM deal",45.99,33.8,13,"Whiskey"),
  mk(14,"Whiskey","Southern","Angel's Envy","750ml","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",43.59,25.4,14,"Whiskey"),
  mk(15,"Whiskey","Southern","Wild Turkey 101","1L","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",31.59,33.8,15,"Whiskey"),
  mk(16,"Whiskey","Southern","Wild Turkey 80","1L","btl",0,0,"discontinue","Accidental order, let run out",0,33.8,16,"Whiskey"),
  mk(17,"Gin","RNDC","Empress Rose Gin","1L","btl",2,0,"standard","",44.79,33.8,17,"Gin"),
  mk(18,"Gin","Southern","Bombay Sapphire","1L","btl",2,6,"standard","",39.59,33.8,18,"Gin"),
  mk(19,"Gin","RNDC","Tanqueray","1L","btl",2,6,"standard","~$26.54 eff (buy 6 get 2)",26.54,33.8,19,"Gin"),
  mk(20,"Gin","RNDC","Hendricks","1L","btl",2,6,"standard","",39.95,33.8,20,"Gin"),
  mk(21,"Liqueurs","RNDC","Fernet Branca","750ml","btl",2,6,"standard","",31.30,25.4,21,"Liqueurs"),
  mk(22,"Vodka","Rolling Still","Pecan Vodka","750ml","btl",2,0,"standard","",0,25.4,22,"Vodka"),
  mk(23,"Vodka","Rolling Still","Green Chile Vodka","750ml","btl",2,6,"standard","",0,25.4,23,"Vodka"),
  mk(24,"Vodka","Rolling Still","Red Chile Vodka","750ml","btl",2,6,"standard","",0,25.4,24,"Vodka"),
  mk(25,"Vodka","Rolling Still","Lavender Vodka","750ml","btl",2,0,"standard","",0,25.4,25,"Vodka"),
  mk(26,"Vodka","Rolling Still","Regular Vodka","750ml","btl",2,0,"standard","",0,25.4,26,"Vodka"),
  mk(27,"Vodka","Southern","Grey Goose","1L","btl",2,0,"standard","",43.59,33.8,27,"Vodka"),
  mk(28,"Vodka","Southern","Tito's","1L","btl",2,12,"standard","~$27.44 eff (buy 3 get 1)",27.44,33.8,28,"Vodka"),
  mk(29,"Vodka","RNDC","Ketel One","1L","btl",2,6,"standard","",33.99,33.8,29,"Vodka"),
  mk(30,"Tequila","Southern","Espolon Blanco","1L","btl",2,6,"standard","",24.99,33.8,30,"Tequila"),
  mk(31,"Tequila","Southern","Teremana Blanco","1L","btl",1,0,"standard","",32.59,33.8,31,"Tequila"),
  mk(32,"Tequila","Southern","De Leon Blanco","750ml","btl",2,0,"standard","",0,25.4,32,"Tequila"),
  mk(33,"Tequila","Southern","Hornitos Plata","1L","btl",2,6,"standard","",32.59,33.8,33,"Tequila"),
  mk(34,"Tequila","Southern","Hornitos Reposado","1L","btl",2,6,"standard","Often free w/ Plata deal",0,33.8,34,"Tequila"),
  mk(35,"Tequila","Southern","Casa Noble Reposado","750ml","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,25.4,35,"Tequila"),
  mk(36,"Tequila","Southern","Casa Noble Anejo","750ml","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,25.4,36,"Tequila"),
  mk(37,"Tequila","Southern","Mi Campo Reposado","1L","btl",2,6,"standard","",0,33.8,37,"Tequila"),
  mk(38,"Tequila","Southern","Sauza Hacienda Gold","1L","btl",0,0,"discontinue","Let it run out",0,33.8,38,"Tequila"),
  mk(39,"Tequila","Southern","Dulce Vida Tequila","750ml","btl",0,0,"discontinue","Quarter left, let run out",0,25.4,39,"Tequila"),
  mk(40,"Tequila","Southern","Patron Silver","750ml","btl",2,6,"standard","",44.59,25.4,40,"Tequila"),
  mk(41,"Tequila","Southern","Don Julio Blanco","1L","btl",2,6,"standard","",48.59,33.8,41,"Tequila"),
  mk(42,"Tequila","Southern","Patron XO Cafe","750ml","btl",0,0,"discontinue","Let run out",0,25.4,42,"Tequila"),
  mk(43,"Vodka","RNDC","New Amsterdam Vodka","1L","btl",4,12,"standard","",10.99,33.8,43,"Vodka"),
  mk(44,"Rum","RNDC","Barton Light Rum","1L","btl",4,12,"standard","",8.11,33.8,44,"Rum"),
  mk(45,"Gin","RNDC","New Amsterdam Gin","1L","btl",4,12,"standard","",11.99,33.8,45,"Gin"),
  mk(46,"Whiskey","RNDC","Evan Williams","1L","btl",4,12,"standard","",11.50,33.8,46,"Whiskey"),
  mk(47,"Tequila","Southern","Mi Campo Blanco","1L","btl",4,12,"always_full","ALWAYS need 2 full cases (12btl)",14.39,33.8,47,"Tequila"),
  mk(48,"Liqueurs","Southern","Triple Sec","1L","btl",4,12,"standard","~$10.07 eff (buy 4 get 1)",10.07,33.8,48,"Liqueurs"),
  mk(49,"Mixers","RNDC","Finest Call Strawberry","1L","btl",1,12,"standard","",4.50,33.8,49,"Mixers"),
  mk(50,"Mixers","RNDC","Finest Call Grenadine","1L","btl",2,6,"below_quarter","Reorder if storage ≤ 0.25",4.50,33.8,50,"Mixers"),
  mk(51,"Mixers","RNDC","Santa Fe Margarita Mix","1L","btl",4,12,"standard","",4.89,33.8,51,"Mixers"),
  mk(52,"Mixers","Webstaurante","Grapefruit Juice","7.2oz cans","case",1,1,"below_quarter","",0,0,52,"Mixers"),
  mk(53,"Mixers","Webstaurante","Cranberry Juice","7.2oz cans","case",1,1,"below_quarter","",0,0,53,"Mixers"),
  mk(54,"Mixers","Webstaurante","Orange Juice","24x7.2oz","case",1,1,"below_quarter","",33.49,0,54,"Mixers"),
  mk(55,"Mixers","Webstaurante","Pineapple Juice","24x7.2oz","case",1,1,"below_quarter","",35.99,0,55,"Mixers"),
  mk(56,"Mixers","RNDC","Finest Call Lime Juice","1L","btl",2,12,"below_half","Reorder if storage ≤ 0.5",6.00,33.8,56,"Mixers"),
  mk(57,"Mixers","RNDC","Finest Call Lemon Juice","1L","btl",2,6,"discontinue","Let it run out",6.30,33.8,57,"Mixers"),
  // Beer & cans behind bar
  mk(58,"Beer","Admiral","Modelo Especial","24pk","case",54,10,"standard","",29.78,0,58,"Beer"),
  mk(59,"Beer","Admiral","Modelo Negra","4/6pk","case",20,3,"standard","",32.30,0,59,"Beer"),
  mk(60,"Beer","Premier","Stella Artois","24pk","case",24,3,"standard","",28.00,0,60,"Beer"),
  mk(61,"Beer","Premier","Michelob Ultra","24pk","case",19,3,"standard","",24.60,0,61,"Beer"),
  mk(62,"Beer","Admiral","Coors Light","2/12pk","case",12,3,"standard","",22.30,0,62,"Beer"),
  mk(63,"Beer","Admiral","Dos Equis","24pk","case",36,8,"standard","",26.80,0,63,"Beer"),
  mk(64,"Beer","Premier","Bud Light","24pk","case",19,3,"standard","",19.80,0,64,"Beer"),
  mk(65,"Beer","Premier","Budweiser","18pk","case",29,3,"standard","",16.30,0,65,"Beer"),
  mk(66,"Beer","Admiral","Corona","24pk","case",37,4,"standard","",29.78,0,66,"Beer"),
  mk(67,"Beer","Admiral","Guinness","2/12pk","case",12,3,"standard","",31.00,0,67,"Beer"),
  mk(68,"Beer","Admiral","Tecate","30pk","case",32,3,"standard","",28.75,0,68,"Beer"),
  mk(69,"Soda/NA","Premier","Zia Vida Sandia","12pk","case",7,1,"standard","",16.80,0,69,"Soda/NA"),
  mk(70,"Soda/NA","Premier","Zia Vida Root Beer","12pk","case",7,1,"standard","",16.80,0,70,"Soda/NA"),
  mk(71,"Seltzers","RNDC","High Noon Tequila Lime","355ml 24pk","case",13,1,"below_half","Reorder if storage ≤ 0.5",45.60,0,71,"Seltzers"),
  mk(72,"Seltzers","RNDC","High Noon Pineapple","355ml 24pk","case",18,1,"below_half","Reorder if storage ≤ 0.5",45.60,0,72,"Seltzers"),
  mk(73,"Beer","Admiral","Angry Orchard","4/6pk","case",7,1,"standard","",32.50,0,73,"Beer"),
  mk(74,"Soda/NA","Admiral","Red Bull","6/4pk","case",20,1,"standard","",42.15,0,74,"Soda/NA"),
  mk(75,"Beer","Premier","Eastciders Original","4/6pk","case",19,1,"standard","",31.50,0,75,"Beer"),
  mk(76,"Beer","Premier","Eastciders Blood Orange","4/6pk","case",24,2,"standard","",31.50,0,76,"Beer"),
  mk(77,"Wine","Fiasco","Rosé","750ml","btl",7,1,"below_threshold","Reorder if storage < 0.5",10.99,25.4,77,"Wine"),
  mk(78,"Wine","Fiasco","Sauvignon Blanc","750ml","btl",6,1,"below_threshold","Reorder if storage < 0.5",9.99,25.4,78,"Wine"),
  mk(79,"Wine","Fiasco","Chardonnay","750ml","btl",6,1,"below_threshold","Reorder if storage < 0.5",10.00,25.4,79,"Wine"),
  mk(80,"Wine","Fiasco","Vinho Verde","750ml","btl",6,1,"below_threshold","Reorder if storage < 0.5",7.87,25.4,80,"Wine"),
  mk(81,"Wine","Fiasco","Prosecco","750ml","btl",4,1,"below_threshold","Reorder if storage < 0.5",13.00,25.4,81,"Wine"),
  mk(82,"Beer","Admiral","Athletic Upside Dawn","2/12pk","case",18,1,"standard","",32.00,0,82,"Beer"),
  mk(83,"Beer","Admiral","Athletic IPA","2/12pk","case",18,1,"standard","",32.00,0,83,"Beer"),
  mk(84,"Beer","Admiral","PBR","30pk","case",50,3,"standard","",23.74,0,84,"Beer"),
  mk(85,"Beer","Premier","Ex Novo Mass Ascension","6x4pk","case",12,4,"standard","",49.50,0,85,"Beer"),
  // Shelf 2 - Liqueurs etc
  mk(86,"Wine","Fiasco","Malbec","750ml","btl",3,1,"below_threshold","Reorder if storage < 0.5",11.00,25.4,86,"Wine"),
  mk(87,"Wine","Fiasco","Pinot Noir","750ml","btl",3,1,"below_threshold","Reorder if storage < 0.5",10.99,25.4,87,"Wine"),
  mk(88,"Rum","Southern","Coconut Rum (Cruzan)","1L","btl",1,0,"standard","Free w/promo",0,33.8,88,"Rum"),
  mk(89,"Liqueurs","Southern","Kahlua","1L","btl",1,6,"standard","",29.00,33.8,89,"Liqueurs"),
  mk(90,"Liqueurs","Southern","Luxardo Maraschino","750ml","btl",1,0,"standard","",32.00,25.4,90,"Liqueurs"),
  mk(91,"Liqueurs","Southern","Blue Curacao","1L","btl",1,0,"standard","Free w/deals",0,33.8,91,"Liqueurs"),
  mk(92,"Liqueurs","RNDC","Southern Comfort","btl","btl",0,0,"discontinue","Let it run out",0,25.4,92,"Liqueurs"),
  mk(93,"Liqueurs","RNDC","Mr. Boston Amaretto","1L","btl",1,12,"standard","",8.90,33.8,93,"Liqueurs"),
  mk(94,"Liqueurs","Southern","E&J Grand Blue","1L","btl",0,0,"discontinue","Let run out",0,33.8,94,"Liqueurs"),
  mk(95,"Liqueurs","Southern","Hiram Walker Blackberry","1L","btl",0,0,"discontinue","Mixer not brandy. Let run out",0,33.8,95,"Liqueurs"),
  mk(96,"Liqueurs","Southern","Pimm's","750ml","btl",0,0,"discontinue","Quarter left, let run out",0,25.4,96,"Liqueurs"),
  mk(97,"Liqueurs","RNDC","Baileys","1L","btl",1,6,"standard","",36.24,33.8,97,"Liqueurs"),
  mk(98,"Liqueurs","Southern","Aperol","1L","btl",1,6,"standard","",31.00,33.8,98,"Liqueurs"),
  mk(99,"Liqueurs","Southern","St. Germain","750ml","btl",1,0,"standard","",34.59,25.4,99,"Liqueurs"),
  mk(100,"Tequila","Southern","Dulce Vida Lime","750ml","btl",0,0,"discontinue","Let run out",0,25.4,100,"Tequila"),
  mk(101,"Liqueurs","Southern","Select Pilla","750ml","btl",0,0,"discontinue","Venetian aperitif. Let run out",0,25.4,101,"Liqueurs"),
  mk(102,"Whiskey","Southern","Piehole Whiskey","750ml","btl",0,0,"discontinue","Quarter left, let run out",0,25.4,102,"Whiskey"),
  mk(103,"Liqueurs","Southern","Creme de Cacao","1L","btl",1,0,"standard","De Kuyper",13.00,33.8,103,"Liqueurs"),
  mk(104,"Liqueurs","RNDC","Mr. Boston Peppermint","1L","btl",1,6,"standard","Don't order Rumple until this runs out",8.90,33.8,104,"Liqueurs"),
  mk(105,"Liqueurs","Southern","Grand Marnier","1L","btl",1,0,"quarter_rule","Don't reorder until bar ≤ 0.25",0,33.8,105,"Liqueurs"),
  mk(106,"Liqueurs","Southern","M&R Vermouth Dry","1L","btl",1,6,"standard","",13.00,33.8,106,"Liqueurs"),
  mk(107,"Liqueurs","Southern","M&R Vermouth Rosso","1L","btl",1,6,"standard","",13.00,33.8,107,"Liqueurs"),
  mk(108,"Liqueurs","Southern","Campari","1L","btl",1,6,"standard","",45.99,33.8,108,"Liqueurs"),
  mk(109,"Liqueurs","RNDC","Peach Schnapps","750ml","btl",1,6,"standard","",4.39,25.4,109,"Liqueurs"),
  mk(110,"Liqueurs","RNDC","Naranja Orange","1L","btl",1,6,"standard","",22.04,33.8,110,"Liqueurs"),
  mk(111,"Liqueurs","Southern","Watermelon Schnapps","1L","btl",1,0,"standard","Free w/promo",0,33.8,111,"Liqueurs"),
  mk(112,"Mezcal","RNDC","Mezcal 400 Conejos","750ml","btl",2,6,"standard","",23.00,25.4,112,"Mezcal"),
  // Additional bar items
  mk(113,"Whiskey","RNDC","Fireball","1L","btl",1,6,"standard","",17.97,33.8,113,"Whiskey"),
  mk(114,"Liqueurs","Southern","Jagermeister","1L","btl",2,0,"standard","",33.59,33.8,114,"Liqueurs"),
  mk(115,"Soda/NA","Southern","Goslings Ginger Beer","4/6pk","case",10,2,"standard","",7.00,12,115,"Soda/NA"),
  mk(116,"Mixers","RNDC","Bloody Mary Mix","1L","btl",1,6,"below_quarter","Reorder if storage ≤ 0.25",4.42,33.8,116,"Mixers"),
  mk(117,"Mixers","RNDC","Clamato Juice","1L","btl",1,6,"below_quarter","Reorder if storage ≤ 0.25",4.42,33.8,117,"Mixers"),
  // === STOCK ROOM ONLY ===
  mk(118,"Mezcal","RNDC","400 Conejos 1.75L","1.75L","btl",0,2,"standard","",0,59.2,999,"Mezcal"),
  mk(119,"Liqueurs","RNDC","Chambord","700ml","btl",0,0,"discontinue","Won't restock",31.55,23.7,999,"Liqueurs"),
  mk(120,"Liqueurs","RNDC","Rumple Minze","1L","btl",0,0,"discontinue","Don't order until peppermint runs out",32.24,33.8,999,"Liqueurs"),
  mk(121,"Soda/NA","Admiral","Jarritos/Mineragua","12pk","case",0,1,"standard","",10.24,0,999,"Soda/NA"),
  // Kegs (stock room only)
  mk(122,"Kegs","Premier","La Cumbre 1/2","1/2 Keg","keg",0,0,"flexible","$160 +$50 dep",160.00,1984,999,"Kegs"),
  mk(123,"Kegs","Premier","La Cumbre 1/6","1/6 Keg","keg",0,0,"flexible","$66 +$50 dep",66.00,661,999,"Kegs"),
  mk(124,"Kegs","Admiral","Marble 1/2","1/2 Keg","keg",0,0,"flexible","$160 +$30 dep",160.00,1984,999,"Kegs"),
  mk(125,"Kegs","Admiral","Marble 1/6","1/6 Keg","keg",0,0,"flexible","$67 +$30 dep",67.00,661,999,"Kegs"),
  mk(126,"Kegs","Bow & Arrow","B&A 1/2","1/2 Keg","keg",0,0,"flexible","$170-195 +$30 dep",170.00,1984,999,"Kegs"),
  mk(127,"Kegs","Bow & Arrow","B&A 1/6","1/6 Keg","keg",0,0,"flexible","$65-125 +$30 dep",65.00,661,999,"Kegs"),
  mk(128,"Kegs","RNDC","Fat Tire 1/2","1/2 Keg","keg",0,0,"standard","",155.00,1984,999,"Kegs"),
  mk(129,"Kegs","RNDC","Fat Tire 1/6","1/6 Keg","keg",0,0,"standard","",72.00,661,999,"Kegs"),
  mk(130,"Kegs","Premier","Tractor 1/6","1/6 Keg","keg",0,0,"flexible","",0,661,999,"Kegs"),
  mk(131,"Kegs","Premier","Ex Novo 1/6","1/6 Keg","keg",0,0,"flexible","",78.00,661,999,"Kegs"),
  // Fountain
  mk(132,"Fountain","Pepsi","Pepsi","BIB","BIB",0,1,"reorder_empty","Reorder when 0",0,0,999,"Fountain"),
  mk(133,"Fountain","Pepsi","Diet Pepsi","BIB","BIB",0,1,"reorder_empty","Reorder when 0",0,0,999,"Fountain"),
  mk(134,"Fountain","Pepsi","Sierra Mist/Starry","BIB","BIB",0,1,"reorder_empty","Reorder when 0",0,0,999,"Fountain"),
  mk(135,"Fountain","Pepsi","Dr. Pepper","BIB","BIB",0,1,"reorder_empty","Reorder when 0",0,0,999,"Fountain"),
  mk(136,"Fountain","Pepsi","Tonic","BIB","BIB",0,1,"reorder_empty","Reorder when 0",0,0,999,"Fountain"),
  mk(137,"Fountain","Pepsi","Lemonade","BIB","BIB",0,1,"reorder_empty","Reorder when 0",0,0,999,"Fountain"),
  // CO2
  mk(138,"CO2","Mathenson CO2","CO2 Tank","50lb","tank",0,2,"below_stor_par","~$37/tank + fees",37.31,0,999,"CO2"),
  // Supplies
  mk(139,"Supplies","Webstaurante","9oz Plastic Cups","Cases","case",0,1,"below_half","",0,0,999,"Supplies"),
  mk(140,"Supplies","Webstaurante","16oz Plastic Cups","Cases","case",0,1,"below_half","",0,0,999,"Supplies"),
  mk(141,"Supplies","Webstaurante","Water Cups","Cases","case",0,1,"below_half","",0,0,999,"Supplies"),
  mk(142,"Supplies","Webstaurante","Jumbo Straws","Boxes","box",0,2,"standard","",0,0,999,"Supplies"),
  mk(143,"Supplies","Webstaurante","Stir Stick Straws","Cases","case",0,1,"standard","",0,0,999,"Supplies"),
  mk(144,"Supplies","Webstaurante","Plastic Forks","Boxes","box",0,1,"below_half","",0,0,999,"Supplies"),
  mk(145,"Supplies","Webstaurante","Plastic Knives","Boxes","box",0,1,"below_half","",0,0,999,"Supplies"),
  mk(146,"Supplies","Webstaurante","Plastic Spoons","Boxes","box",0,1,"below_half","",0,0,999,"Supplies"),
  mk(147,"Supplies","Webstaurante","Napkins (Dispenser)","Boxes","box",0,1,"below_quarter","",0,0,999,"Supplies"),
  mk(148,"Supplies","Webstaurante","Napkins (Beverage)","Boxes","box",0,1,"below_quarter","",0,0,999,"Supplies"),
  mk(149,"Supplies","Webstaurante","Large To-Go Boxes","Boxes","box",0,1,"below_quarter","",0,0,999,"Supplies"),
  mk(150,"Supplies","Webstaurante","Small To-Go Boxes","Boxes","box",0,1,"below_quarter","",0,0,999,"Supplies"),
  mk(151,"Supplies","Webstaurante","To-Go Ramekins","Cases","case",0,1,"below_quarter","",0,0,999,"Supplies"),
  mk(152,"Supplies","Webstaurante","To-Go Ramekin Lids","Cases","case",0,1,"below_quarter","",0,0,999,"Supplies"),
  mk(153,"Supplies","Webstaurante","To-Go Bags","Cases","case",0,1,"below_quarter","",0,0,999,"Supplies"),
  mk(154,"Supplies","Webstaurante","Coconut Puree","Cases","case",0,1,"below_quarter","",0,0,999,"Supplies"),
  // Food (Shamrock)
  mk(155,"Food","Shamrock","Prickly Pear Syrup","—","ea",0,0,"chef_order","Tell chef Sunday",0,0,999,"Food"),
  mk(156,"Food","Shamrock","Mint","—","ea",0,0,"chef_order","Tell chef Sunday",0,0,999,"Food"),
  mk(157,"Food","Shamrock","Watermelon","—","ea",0,0,"chef_order","Tell chef Sunday",0,0,999,"Food"),
  // Bar Essentials
  mk(158,"Bar Essentials","TBD","Angostura Bitters","btl","btl",2,1,"below_quarter","",0,0,999,"Bar Essentials"),
  mk(159,"Bar Essentials","TBD","Luxardo Cherries","jar","jar",1,2,"standard","",0,0,999,"Bar Essentials"),
  mk(160,"Bar Essentials","TBD","Tajin","case","case",1,1,"below_quarter","",0,0,999,"Bar Essentials"),
];

const STOR_CATS=["Tequila","Vodka","Whiskey","Gin","Rum","Mezcal","Liqueurs","Mixers","Beer","Wine","Seltzers","Soda/NA","Kegs","Fountain","CO2","Supplies","Food","Bar Essentials"];

function getStatus(p){
  if(p.disc||p.rule==="discontinue")return{level:"skip",label:"Disc.",color:"#9ca3af"};
  if(p.rule==="chef_order")return{level:"info",label:"Chef",color:"#60a5fa"};
  if(p.rule==="flexible")return{level:"info",label:"Flex",color:"#60a5fa"};
  const total=(p.barStock||0)+(p.storStock||0);
  const totalPar=(p.barPar||0)+(p.storPar||0);
  if(p.rule==="always_full")return(p.storStock||0)<(p.storPar||0)?{level:"red",label:"ORDER",color:"#ef4444"}:{level:"green",label:"OK",color:"#22c55e"};
  if(p.rule==="reorder_empty")return(p.storStock||0)<=0?{level:"yellow",label:"ORDER",color:"#eab308"}:{level:"green",label:"OK",color:"#22c55e"};
  if(p.rule==="below_stor_par")return(p.storStock||0)<(p.storPar||0)?{level:"yellow",label:"ORDER",color:"#eab308"}:{level:"green",label:"OK",color:"#22c55e"};
  if(p.rule==="below_threshold")return(p.storStock||0)<0.5?{level:"yellow",label:"ORDER",color:"#eab308"}:{level:"green",label:"OK",color:"#22c55e"};
  if(p.rule==="below_quarter")return(p.storStock||0)<=0.25?{level:"yellow",label:"ORDER",color:"#eab308"}:{level:"green",label:"OK",color:"#22c55e"};
  if(p.rule==="below_half")return(p.storStock||0)<=0.5?{level:"yellow",label:"ORDER",color:"#eab308"}:{level:"green",label:"OK",color:"#22c55e"};
  if(p.rule==="quarter_rule"){
    if(totalPar===0)return{level:"green",label:"OK",color:"#22c55e"};
    return total<=totalPar*0.25?{level:"yellow",label:"ORDER",color:"#eab308"}:{level:"green",label:"OK",color:"#22c55e"};
  }
  if(totalPar===0)return{level:"green",label:"OK",color:"#22c55e"};
  if(total===0)return{level:"red",label:"OUT",color:"#ef4444"};
  if(total<totalPar*0.3)return{level:"red",label:"LOW",color:"#ef4444"};
  if(total<totalPar*0.6)return{level:"yellow",label:"LOW",color:"#eab308"};
  return{level:"green",label:"OK",color:"#22c55e"};
}

const R=n=>Math.round(n*100)/100;

async function dbLoad(){try{const{data,error}=await supabase.from("app_state").select("data").eq("id","main").single();if(error)throw error;return data?.data||{};}catch(e){console.error(e);return{};}}
async function dbSave(s){try{await supabase.from("app_state").upsert({id:"main",data:s,updated_at:new Date().toISOString()});}catch(e){console.error(e);}}

function SearchSelect({items,value,onChange,placeholder}){
  const[open,setOpen]=useState(false);const[q,setQ]=useState("");const ref=useRef();
  const sel=items.find(i=>String(i.id)===String(value));
  const fil=q?items.filter(i=>i.label.toLowerCase().includes(q.toLowerCase())):items;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  return(<div ref={ref} style={{position:"relative",width:"100%"}}>
    <input value={open?q:(sel?.label||"")} onChange={e=>{setQ(e.target.value);if(!open)setOpen(true);}} onFocus={()=>{setOpen(true);setQ("");}} placeholder={placeholder||"Search..."} style={{width:"100%",padding:"8px",borderRadius:6,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}} inputMode="search"/>
    {open&&<div style={{position:"absolute",top:"100%",left:0,right:0,maxHeight:200,overflow:"auto",background:"#fff",border:"1px solid #ccc",borderRadius:6,zIndex:20,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
      {fil.slice(0,30).map(i=><div key={i.id} onClick={()=>{onChange(String(i.id));setOpen(false);setQ("");}} style={{padding:"8px 10px",fontSize:12,cursor:"pointer",borderBottom:"1px solid #f0f0f0"}}>{i.label}</div>)}
      {fil.length===0&&<div style={{padding:10,fontSize:12,color:"#888"}}>No results</div>}
    </div>}
  </div>);
}

export default function App(){
  const[auth,setAuth]=useState(false);const[pw,setPw]=useState("");const[pwErr,setPwErr]=useState(false);
  const[products,setProducts]=useState(INIT);const[suppliers,setSuppliers]=useState(DEFAULT_SUP);
  const[snapshots,setSnapshots]=useState([]);const[deliveries,setDeliveries]=useState([]);
  const[orderLog,setOrderLog]=useState([]);const[recipes,setRecipes]=useState([]);
  const[pourCostLog,setPourCostLog]=useState([]);const[varianceLog,setVarianceLog]=useState([]);
  const[posImports,setPosImports]=useState([]);const[activity,setActivity]=useState([]);
  const[view,setView]=useState("home");const[loaded,setLoaded]=useState(false);const[saving,setSaving]=useState(false);
  // Inventory count state
  const[counting,setCounting]=useState(false);const[countDate,setCountDate]=useState(null);
  const[countLoc,setCountLoc]=useState("tiki");const[countData,setCountData]=useState({tiki:{},pavilion:{},bar:{},storage:{}});
  // Various UI state
  const[filter,setFilter]=useState("all");const[supFilter,setSupFilter]=useState("all");const[catFilter,setCatFilter]=useState("all");const[search,setSearch]=useState("");
  const[editId,setEditId]=useState(null);const[ef,setEf]=useState({});
  const[showAdd,setShowAdd]=useState(false);const[np,setNp]=useState({name:"",cat:"Tequila",supplier:"Southern",size:"1L",unit:"btl",barPar:0,storPar:0,cost:0,oz:33.8,rule:"standard",ruleNote:"",barPos:999});
  // Recipes
  const[rName,setRName]=useState("");const[rIng,setRIng]=useState([{pid:"",oz:""}]);const[rPrice,setRPrice]=useState("");const[rEditId,setREditId]=useState(null);
  // Finance
  const[finTab,setFinTab]=useState("value");const[ipProd,setIpProd]=useState("");const[ipCost,setIpCost]=useState("");
  // Pricing in recipes
  const[dpC,setDpC]=useState("");const[dpB,setDpB]=useState("33.8");const[dpP,setDpP]=useState("1.5");const[dpT,setDpT]=useState("20");
  // Delivery receiving
  const[delSup,setDelSup]=useState("");const[delItems,setDelItems]=useState([]);
  // Contacts editing
  const[editSup,setEditSup]=useState(null);const[supForm,setSupForm]=useState({});
  // Snap viewer
  const[snapView,setSnapView]=useState(null);
  // Order text
  const[copiedSup,setCopiedSup]=useState("");

  const load=useCallback(async()=>{
    const d=await dbLoad();
    if(d.products)setProducts(d.products);if(d.suppliers)setSuppliers(d.suppliers);
    if(d.snapshots)setSnapshots(d.snapshots);if(d.deliveries)setDeliveries(d.deliveries);
    if(d.orderLog)setOrderLog(d.orderLog);if(d.recipes)setRecipes(d.recipes);
    if(d.pourCostLog)setPourCostLog(d.pourCostLog);if(d.varianceLog)setVarianceLog(d.varianceLog);
    if(d.posImports)setPosImports(d.posImports);if(d.activity)setActivity(d.activity);
    setLoaded(true);
  },[]);
  useEffect(()=>{if(auth)load();},[auth,load]);

  const save=useCallback(async(overrides={})=>{
    setSaving(true);
    const state={products,suppliers,snapshots,deliveries,orderLog,recipes,pourCostLog,varianceLog,posImports,activity,ts:new Date().toISOString(),...overrides};
    await dbSave(state);setSaving(false);
  },[products,suppliers,snapshots,deliveries,orderLog,recipes,pourCostLog,varianceLog,posImports,activity]);

  const addActivity=(type,detail)=>{const na=[...activity,{id:Date.now(),date:new Date().toISOString(),type,detail}];setActivity(na);return na;};

  // === INVENTORY COUNT ===
  const startCount=()=>{setCounting(true);setCountDate(new Date().toISOString());setCountLoc("tiki");setCountData({tiki:{},pavilion:{},bar:{},storage:{}});};

  const setCountVal=(loc,pid,val)=>{setCountData(prev=>({...prev,[loc]:{...prev[loc],[pid]:parseFloat(val)||0}}));};

  const submitCount=()=>{
    const np2=products.map(p=>{
      const tiki=countData.tiki[p.id]||0;const pav=countData.pavilion[p.id]||0;
      const bar=countData.bar[p.id]||0;const stor=countData.storage[p.id]||0;
      return{...p,barStock:tiki+pav+bar,storStock:stor};
    });
    setProducts(np2);
    const snap={id:Date.now(),date:countDate,items:np2.map(p=>({id:p.id,bar:p.barStock,stor:p.storStock,total:p.barStock+p.storStock})),locations:countData};
    const ns=[...snapshots,snap];if(ns.length>52)ns.shift();setSnapshots(ns);
    const na=addActivity("inventory",`Full inventory submitted (${Object.keys(countData.bar).length} bar, ${Object.keys(countData.storage).length} storage items counted)`);
    save({products:np2,snapshots:ns,activity:na});setCounting(false);
  };

  // === DELIVERY RECEIVING ===
  const startDelivery=(sup)=>{
    setDelSup(sup);
    const supItems=products.filter(p=>p.supplier===sup&&p.rule!=="discontinue"&&!p.disc);
    setDelItems(supItems.map(p=>({id:p.id,name:p.name,size:p.size,unit:p.unit,qty:0,isCase:false,perCase:0})));
  };

  const submitDelivery=()=>{
    if(!delSup)return;
    const items=delItems.filter(i=>i.qty>0).map(i=>{
      const totalUnits=i.isCase&&i.perCase>0?i.qty*i.perCase:i.qty;
      return{...i,totalUnits};
    });
    if(items.length===0)return;
    const del={id:Date.now(),date:new Date().toISOString(),supplier:delSup,items};
    const nd=[...deliveries,del];setDeliveries(nd);
    const na=addActivity("delivery",`${delSup}: ${items.map(i=>`${i.name} x${i.totalUnits}`).join(", ")}`);
    save({deliveries:nd,activity:na});setDelSup("");setDelItems([]);
  };

  // === RECIPES ===
  const allIngredients=useMemo(()=>products.filter(p=>p.ozPerBottle>0).map(p=>({id:p.id,label:`${p.name} (${p.size}${p.cost?` $${p.cost}`:""})`})),[products]);
  const saveRecipe=()=>{if(!rName)return;const vi=rIng.filter(i=>i.pid&&i.oz);const rec={id:rEditId||Date.now(),name:rName,ingredients:vi,menuPrice:parseFloat(rPrice)||0};const nr=rEditId?recipes.map(r=>r.id===rEditId?rec:r):[...recipes,rec];setRecipes(nr);save({recipes:nr});setRName("");setRIng([{pid:"",oz:""}]);setRPrice("");setREditId(null);};
  const recipeCost=(rec)=>{let t=0;rec.ingredients.forEach(i=>{const p=products.find(x=>x.id===parseInt(i.pid));if(p&&p.cost>0&&p.ozPerBottle>0)t+=(p.cost/p.ozPerBottle)*parseFloat(i.oz);});return t;};

  // === ORDERS ===
  const supGroups=useMemo(()=>{
    const g={};products.forEach(p=>{const s=getStatus(p);if(["red","yellow"].includes(s.level)){if(!g[p.supplier])g[p.supplier]=[];g[p.supplier].push({...p,status:s});}});return g;
  },[products]);

  const generateOrderText=(sup)=>{
    const items=supGroups[sup];if(!items)return"";
    const info=suppliers[sup];
    let txt=`Hey ${info?.ct||sup}, need for this week:\n`;
    items.forEach(p=>txt+=`• ${p.name} (${p.size})\n`);
    return txt+`\nThanks!`;
  };

  // === VARIANCE ===
  const calcVariance=useMemo(()=>{
    if(snapshots.length<2)return null;
    const curr=snapshots[snapshots.length-1];const prev=snapshots[snapshots.length-2];
    const weekDels=deliveries.filter(d=>{const dd=new Date(d.date);const pd=new Date(prev.date);const cd=new Date(curr.date);return dd>=pd&&dd<=cd;});
    const results=[];
    products.forEach(p=>{
      if(p.disc||p.rule==="discontinue"||!p.ozPerBottle)return;
      const prevItem=prev.items.find(i=>i.id===p.id);const currItem=curr.items.find(i=>i.id===p.id);
      if(!prevItem||!currItem)return;
      let received=0;weekDels.forEach(d=>{const di=d.items.find(i=>i.id===p.id);if(di)received+=di.totalUnits;});
      const usage=prevItem.total+received-currItem.total;
      if(usage>0||received>0)results.push({id:p.id,name:p.name,prev:prevItem.total,received,curr:currItem.total,usage:R(usage),cost:R(usage*p.cost)});
    });
    return results.sort((a,b)=>b.cost-a.cost);
  },[snapshots,deliveries,products]);

  // === STATS ===
  const stats=useMemo(()=>{let r=0,y=0,g=0;products.forEach(p=>{const s=getStatus(p);if(s.level==="red")r++;else if(s.level==="yellow")y++;else if(s.level==="green")g++;});return{r,y,g};},[products]);
  const totalVal=useMemo(()=>products.reduce((t,p)=>t+(p.cost*((p.barStock||0)+(p.storStock||0))),0),[products]);

  const filtered=useMemo(()=>{
    let f=[...products];
    if(filter==="red")f=f.filter(p=>getStatus(p).level==="red");
    else if(filter==="yellow")f=f.filter(p=>getStatus(p).level==="yellow");
    else if(filter==="green")f=f.filter(p=>getStatus(p).level==="green");
    if(supFilter!=="all")f=f.filter(p=>p.supplier===supFilter);
    if(catFilter!=="all")f=f.filter(p=>p.cat===catFilter);
    if(search)f=f.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
    return f.sort((a,b)=>a.barPos-b.barPos);
  },[products,filter,supFilter,catFilter,search]);

  const dayN=new Date().getDay();const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const deadlines=[...(dayN===0?[{s:"Shamrock",n:"Remind chef"}]:[]),...(dayN===1?[{s:"Shamrock",n:"ORDER by 5pm"},{s:"Southern",n:"Start (due Tue 3pm)"},{s:"Premier",n:"Start (due Wed noon)"},{s:"Admiral",n:"Start (due Wed 3pm)"},{s:"Fiasco",n:"Start (due Tue 3pm)"}]:[]),...(dayN===2?[{s:"Southern",n:"LAST DAY — 3pm"},{s:"Fiasco",n:"LAST DAY — 3pm"},{s:"RNDC",n:"Biweekly — 3pm"},{s:"Pepsi",n:"Before 2pm"},{s:"Shamrock",n:"DELIVERY"},{s:"Pepsi",n:"DELIVERY"}]:[]),...(dayN===3?[{s:"Premier",n:"LAST DAY — Noon"},{s:"Admiral",n:"LAST DAY — 3pm"}]:[]),...(dayN===4?[{s:"Southern",n:"DELIVERY"},{s:"Premier",n:"DELIVERY"},{s:"Fiasco",n:"DELIVERY"},{s:"RNDC",n:"DELIVERY"}]:[]),...(dayN===5?[{s:"Admiral",n:"DELIVERY"}]:[])];

  // Pricing tool
  const dpSug=useMemo(()=>{const c=parseFloat(dpC)||0,bo=parseFloat(dpB)||1,po=parseFloat(dpP)||1,t=parseFloat(dpT)||20;if(!c)return 0;return R((c/bo*po)/(t/100));},[dpC,dpB,dpP,dpT]);

  // Priority ordering for dashboard
  const dashItems=useMemo(()=>{
    const items=products.filter(p=>{const s=getStatus(p);return["red","yellow"].includes(s.level);}).map(p=>({...p,status:getStatus(p)}));
    const anytime=items.filter(p=>["Webstaurante","Mathenson CO2","Rolling Still"].includes(p.supplier));
    const separate=items.filter(p=>["Pepsi","Shamrock"].includes(p.supplier));
    const weekly=items.filter(p=>!["Webstaurante","Mathenson CO2","Rolling Still","Pepsi","Shamrock"].includes(p.supplier));
    return{anytime,separate,weekly};
  },[products]);

  const kitchenItems=products.filter(p=>p.cat==="Food");

  const S={
    wrap:{fontFamily:"system-ui,-apple-system,sans-serif",maxWidth:800,margin:"0 auto",padding:"0 12px 80px",background:"#fff",color:"#333",minHeight:"100vh"},
    nav:{display:"flex",gap:3,padding:"10px 0",borderBottom:"1px solid #e0e0e0",marginBottom:14,flexWrap:"wrap",position:"sticky",top:0,background:"#fff",zIndex:10},
    nb:a=>({padding:"6px 10px",borderRadius:8,border:"none",fontSize:11,fontWeight:500,cursor:"pointer",background:a?"#1B2A4A":"#f0f0f0",color:a?"#fff":"#333"}),
    card:{background:"#fff",borderRadius:10,border:"1px solid #e8e8e8",padding:14,marginBottom:10},
    inp:{width:60,padding:"6px",borderRadius:6,border:"1px solid #ccc",fontSize:14,textAlign:"center",background:"#fff",color:"#333"},
    inpF:{width:"100%",padding:"8px",borderRadius:6,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"},
    sel:{padding:"6px 10px",borderRadius:6,border:"1px solid #ccc",fontSize:12},
    btn:{padding:"8px 16px",borderRadius:6,border:"none",background:"#1B2A4A",color:"#fff",fontSize:13,cursor:"pointer"},
    btnO:{padding:"8px 14px",borderRadius:6,border:"1px solid #ccc",background:"#fff",fontSize:12,cursor:"pointer"},
    lbl:{fontSize:11,color:"#888",marginBottom:2},
    badge:s=>({display:"inline-block",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,color:"#fff",background:s.color}),
    qBtn:(active)=>({padding:"8px 12px",borderRadius:8,border:active?"2px solid #1B2A4A":"1px solid #ccc",background:active?"#e8f0fe":"#fff",fontSize:13,fontWeight:600,cursor:"pointer",minWidth:40,textAlign:"center"}),
  };

  // === LOGIN ===
  if(!auth)return(<div style={{...S.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
    <div style={{fontSize:22,fontWeight:600,color:"#1B2A4A",marginBottom:4}}>KTaos Bar</div>
    <p style={{color:"#888",fontSize:13,marginBottom:20}}>Enter password</p>
    <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwErr(false);}} onKeyDown={e=>{if(e.key==="Enter"){pw===PASSWORD?setAuth(true):setPwErr(true);}}} placeholder="Password" style={{padding:"10px 16px",borderRadius:8,border:`1px solid ${pwErr?"#ef4444":"#ccc"}`,fontSize:16,width:220,textAlign:"center",marginBottom:10}} autoFocus/>
    <button onClick={()=>pw===PASSWORD?setAuth(true):setPwErr(true)} style={S.btn}>Enter</button>
    {pwErr&&<p style={{color:"#ef4444",fontSize:13,marginTop:8}}>Wrong password</p>}
  </div>);

  if(!loaded)return<div style={S.wrap}><p style={{textAlign:"center",padding:40,color:"#888"}}>Loading...</p></div>;

  // === COUNT MODE ===
  if(counting){
    const locs=["tiki","pavilion","bar","storage"];
    const locLabels={tiki:"Tiki Bar",pavilion:"Pavilion",bar:"Bar",storage:"Stock Room"};
    const locIdx=locs.indexOf(countLoc);

    const getLocItems=()=>{
      if(countLoc==="bar")return products.filter(p=>p.barPos<999).sort((a,b)=>a.barPos-b.barPos);
      if(countLoc==="storage")return products.sort((a,b)=>{const ci=STOR_CATS.indexOf(a.storCat)-STOR_CATS.indexOf(b.storCat);return ci!==0?ci:a.name.localeCompare(b.name);});
      return[];// tiki/pavilion are search-based
    };

    const locItems=getLocItems();
    const isTikiPav=countLoc==="tiki"||countLoc==="pavilion";

    return(<div style={S.wrap}>
      <div style={{padding:"14px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{margin:0,fontSize:18,fontWeight:600}}>{locLabels[countLoc]}</h2>
        <p style={{margin:0,fontSize:11,color:"#888"}}>Step {locIdx+1} of 4{saving?" · Saving...":""}</p></div>
        <button onClick={()=>{if(window.confirm("Cancel this count?"))setCounting(false);}} style={S.btnO}>Cancel</button>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:14}}>
        {locs.map((l,i)=><div key={l} style={{flex:1,padding:"6px 4px",borderRadius:8,textAlign:"center",fontSize:10,fontWeight:500,background:countLoc===l?"#1B2A4A":(i<locIdx?"#d4edda":"#f0f0f0"),color:countLoc===l?"#fff":(i<locIdx?"#085041":"#888")}}>{locLabels[l]}</div>)}
      </div>

      {isTikiPav&&<>
        <p style={{fontSize:12,color:"#888",marginBottom:8}}>Search for items at this location and enter counts</p>
        <SearchSelect items={products.filter(p=>p.barPos<999).map(p=>({id:p.id,label:p.name}))} value="" onChange={v=>{if(v&&!countData[countLoc][v])setCountVal(countLoc,parseInt(v),0);}} placeholder="Search to add item..."/>
        <div style={{marginTop:10}}>
          {Object.entries(countData[countLoc]).map(([pid,val])=>{
            const p=products.find(x=>x.id===parseInt(pid));if(!p)return null;
            return<div key={pid} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
              <span style={{fontSize:13,fontWeight:500}}>{p.name}</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input type="number" inputMode="decimal" value={val||""} onChange={e=>setCountVal(countLoc,parseInt(pid),e.target.value)} style={{...S.inp,width:50}}/>
                <button onClick={()=>{const nd={...countData[countLoc]};delete nd[pid];setCountData(prev=>({...prev,[countLoc]:nd}));}} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>×</button>
              </div>
            </div>;
          })}
        </div>
      </>}

      {countLoc==="bar"&&<>
        {locItems.map(p=>{
          const val=countData.bar[p.id]||"";
          return<div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.size} · {p.unit}</div></div>
            <div style={{display:"flex",gap:3,alignItems:"center"}}>
              {p.unit==="btl"&&<div style={{display:"flex",gap:2}}>
                {[0,0.25,0.5,0.75].map(q=><button key={q} style={S.qBtn(val!==null&&val!==undefined&&val!==0&&val%1===q)} onClick={()=>setCountVal("bar",p.id,Math.floor(val||0)+q)}>{q===0?"0":q===0.25?"¼":q===0.5?"½":"¾"}</button>)}
              </div>}
              <input type="number" inputMode="decimal" value={val} onChange={e=>setCountVal("bar",p.id,e.target.value)} style={{...S.inp,width:55}}/>
            </div>
          </div>;
        })}
      </>}

      {countLoc==="storage"&&<>
        {STOR_CATS.map(cat=>{
          const items=locItems.filter(p=>p.storCat===cat);if(items.length===0)return null;
          const isKeg=cat==="Kegs";
          return<div key={cat}>
            <div style={{fontSize:13,fontWeight:600,color:"#1B2A4A",padding:"10px 0 6px",borderBottom:"2px solid #1B2A4A",marginTop:8}}>{cat}</div>
            {items.map(p=>{
              const val=countData.storage[p.id]||"";
              return<div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
                <div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.size} · {p.unit}</div></div>
                <input type="number" inputMode="decimal" value={val} onChange={e=>setCountVal("storage",p.id,e.target.value)} style={{...S.inp,width:55}}/>
              </div>;
            })}
          </div>;
        })}
      </>}

      <div style={{display:"flex",gap:8,padding:"16px 0",position:"sticky",bottom:0,background:"#fff",borderTop:"1px solid #e0e0e0"}}>
        {locIdx>0&&<button onClick={()=>setCountLoc(locs[locIdx-1])} style={S.btnO}>← Back</button>}
        <div style={{flex:1}}/>
        {locIdx<3&&<button onClick={()=>setCountLoc(locs[locIdx+1])} style={S.btn}>Next →</button>}
        {locIdx===3&&<button onClick={submitCount} style={{...S.btn,background:"#22c55e"}}>Submit Inventory ✓</button>}
      </div>
    </div>);
  }

  // === DELIVERY MODE ===
  if(delSup){
    return(<div style={S.wrap}>
      <div style={{padding:"14px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{margin:0,fontSize:18,fontWeight:600}}>Receiving: {delSup}</h2>
        <p style={{margin:0,fontSize:11,color:"#888"}}>Enter what actually arrived</p></div>
        <button onClick={()=>{setDelSup("");setDelItems([]);}} style={S.btnO}>Cancel</button>
      </div>
      {delItems.map((item,idx)=><div key={item.id} style={{padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{item.name}</div><div style={{fontSize:10,color:"#888"}}>{item.size}</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <label style={{fontSize:11,display:"flex",alignItems:"center",gap:3}}>
              <input type="checkbox" checked={item.isCase} onChange={e=>{const ni=[...delItems];ni[idx].isCase=e.target.checked;setDelItems(ni);}}/>Case
            </label>
            {item.isCase&&<input type="number" inputMode="numeric" placeholder="#/cs" value={item.perCase||""} onChange={e=>{const ni=[...delItems];ni[idx].perCase=parseInt(e.target.value)||0;setDelItems(ni);}} style={{...S.inp,width:40,fontSize:11}}/>}
            <input type="number" inputMode="numeric" value={item.qty||""} onChange={e=>{const ni=[...delItems];ni[idx].qty=parseInt(e.target.value)||0;setDelItems(ni);}} style={{...S.inp,width:50}} placeholder="Qty"/>
          </div>
        </div>
      </div>)}
      <div style={{padding:"16px 0"}}><button onClick={submitDelivery} style={{...S.btn,background:"#22c55e",width:"100%"}}>Log Delivery ✓</button></div>
    </div>);
  }

  // === MAIN APP ===
  return(<div style={S.wrap}>
    <div style={{padding:"14px 0 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h1 style={{margin:0,fontSize:20,fontWeight:600,color:"#1B2A4A"}}>KTaos Bar</h1>
      <p style={{margin:"2px 0 0",fontSize:11,color:"#888"}}>{days[dayN]}{totalVal>0?` · $${Math.round(totalVal).toLocaleString()}`:""}{saving?" · Saving...":""}</p></div>
      <button onClick={()=>setAuth(false)} style={{fontSize:11,color:"#999",background:"none",border:"none",cursor:"pointer"}}>Lock</button>
    </div>

    <div style={S.nav}>
      {[["home","Home"],["inventory","Inventory"],["orders","Orders"],["recipes","Recipes"],["variance","Variance"],["finance","Finance"],["activity","Activity"],["contacts","Contacts"]].map(([v,l])=><button key={v} style={S.nb(view===v)} onClick={()=>setView(v)}>{l}</button>)}
    </div>

    {/* === HOME === */}
    {view==="home"&&<>
      {deadlines.length>0&&<div style={{...S.card,background:"#FFFBEB",borderColor:"#FAC775"}}><div style={{fontSize:13,fontWeight:600,color:"#854F0B",marginBottom:6}}>Today</div>{deadlines.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12}}><span style={{fontWeight:500}}>{d.s}</span><span style={{color:d.n.includes("DELIVERY")?"#16a34a":d.n.includes("LAST")?"#ef4444":"#555"}}>{d.n}</span></div>)}</div>}

      <div style={{display:"flex",gap:6,marginBottom:14}}>
        <div style={{flex:1,padding:"10px 4px",borderRadius:10,textAlign:"center",background:"#ffe0e0",cursor:"pointer"}} onClick={()=>{setView("orders");setFilter("red");}}><div style={{fontSize:22,fontWeight:600,color:"#991B1B"}}>{stats.r}</div><div style={{fontSize:10,color:"#991B1B"}}>Urgent</div></div>
        <div style={{flex:1,padding:"10px 4px",borderRadius:10,textAlign:"center",background:"#fef3c7",cursor:"pointer"}} onClick={()=>{setView("orders");setFilter("yellow");}}><div style={{fontSize:22,fontWeight:600,color:"#854F0B"}}>{stats.y}</div><div style={{fontSize:10,color:"#854F0B"}}>Low</div></div>
        <div style={{flex:1,padding:"10px 4px",borderRadius:10,textAlign:"center",background:"#d4edda",cursor:"pointer"}}><div style={{fontSize:22,fontWeight:600,color:"#085041"}}>{stats.g}</div><div style={{fontSize:10,color:"#085041"}}>Good</div></div>
      </div>

      {kitchenItems.length>0&&<div style={{...S.card,background:"#fef9e7",borderColor:"#f5d76e"}}><div style={{fontSize:13,fontWeight:600,color:"#7d6608",marginBottom:6}}>Kitchen needs</div>
        {kitchenItems.map(p=><div key={p.id} style={{fontSize:12,padding:"3px 0"}}>{p.name}{p.notes?` — ${p.notes}`:""}</div>)}
      </div>}

      {dashItems.anytime.length>0&&<div style={S.card}><div style={{fontSize:13,fontWeight:600,marginBottom:8,color:"#1B2A4A"}}>Order anytime</div>
        {dashItems.anytime.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><div><span style={{fontWeight:500}}>{p.name}</span> <span style={{color:"#888"}}>{p.supplier}</span></div><span style={S.badge(p.status)}>{p.status.label}</span></div>)}
      </div>}

      {dashItems.separate.length>0&&<div style={S.card}><div style={{fontSize:13,fontWeight:600,marginBottom:8,color:"#1B2A4A"}}>Separate orders</div>
        {dashItems.separate.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><div><span style={{fontWeight:500}}>{p.name}</span> <span style={{color:"#888"}}>{p.supplier}</span></div><span style={S.badge(p.status)}>{p.status.label}</span></div>)}
      </div>}

      {dashItems.weekly.length>0&&<div style={S.card}><div style={{fontSize:13,fontWeight:600,marginBottom:8,color:"#1B2A4A"}}>Weekly order</div>
        {dashItems.weekly.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><div><span style={{fontWeight:500}}>{p.name}</span> <span style={{color:"#888"}}>{p.supplier}</span></div><span style={S.badge(p.status)}>{p.status.label}</span></div>)}
      </div>}
    </>}

    {/* === INVENTORY === */}
    {view==="inventory"&&<>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        <button onClick={startCount} style={{...S.btn,background:"#22c55e"}}>Start Count</button>
        <button onClick={()=>setShowAdd(!showAdd)} style={S.nb(showAdd)}>+ Add Item</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={S.sel}><option value="all">All categories</option>{[...new Set(products.map(p=>p.cat))].map(c=><option key={c}>{c}</option>)}</select>
        <select value={supFilter} onChange={e=>setSupFilter(e.target.value)} style={S.sel}><option value="all">All suppliers</option>{Object.keys(suppliers).map(s=><option key={s}>{s}</option>)}</select>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:100,...S.inpF,padding:"6px 10px"}}/>
      </div>

      {showAdd&&<div style={{...S.card,borderColor:"#22c55e"}}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Add product</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={S.lbl}>Name</div><input value={np.name} onChange={e=>setNp({...np,name:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Category</div><select value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})} style={{...S.sel,width:"100%"}}>{[...new Set(products.map(p=>p.cat))].map(c=><option key={c}>{c}</option>)}</select></div>
          <div><div style={S.lbl}>Supplier</div><select value={np.supplier} onChange={e=>setNp({...np,supplier:e.target.value})} style={{...S.sel,width:"100%"}}>{Object.keys(suppliers).map(s=><option key={s}>{s}</option>)}</select></div>
          <div><div style={S.lbl}>Size</div><input value={np.size} onChange={e=>setNp({...np,size:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Unit</div><input value={np.unit} onChange={e=>setNp({...np,unit:e.target.value})} style={S.inpF} placeholder="btl/case/keg"/></div>
          <div><div style={S.lbl}>Cost ($)</div><input type="number" inputMode="decimal" value={np.cost||""} onChange={e=>setNp({...np,cost:e.target.value})} style={S.inpF}/></div>
          <div><div style={S.lbl}>Bar position</div><input type="number" inputMode="numeric" value={np.barPos||""} onChange={e=>setNp({...np,barPos:e.target.value})} style={S.inpF} placeholder="999=storage only"/></div>
          <div><div style={S.lbl}>Oz/bottle</div><input type="number" inputMode="decimal" value={np.oz||""} onChange={e=>setNp({...np,oz:e.target.value})} style={S.inpF}/></div>
        </div>
        <button onClick={()=>{
          if(!np.name)return;
          const maxId=Math.max(...products.map(p=>p.id),0)+1;
          const newP=mk(maxId,np.cat,np.supplier,np.name,np.size,np.unit,0,0,np.rule,np.ruleNote,parseFloat(np.cost)||0,parseFloat(np.oz)||0,parseInt(np.barPos)||999,np.cat);
          // Insert at position: bump everything after
          const pos=parseInt(np.barPos)||999;
          const updated=products.map(p=>p.barPos>=pos&&p.barPos<999?{...p,barPos:p.barPos+1}:p);
          updated.push(newP);
          setProducts(updated);save({products:updated});setShowAdd(false);
          setNp({name:"",cat:"Tequila",supplier:"Southern",size:"1L",unit:"btl",barPar:0,storPar:0,cost:0,oz:33.8,rule:"standard",ruleNote:"",barPos:999});
        }} style={S.btn}>Add</button>
      </div>}

      <div style={{fontSize:11,color:"#888",marginBottom:6}}>{filtered.length} items</div>
      {filtered.map(p=>{const s=getStatus(p);const ed=editId===p.id;const total=(p.barStock||0)+(p.storStock||0);
        return<div key={p.id} style={{...S.card,padding:10,borderLeftColor:s.color,borderLeftWidth:3,borderLeftStyle:"solid"}} onClick={()=>{if(!ed){setEditId(p.id);setEf({bar:String(p.barStock||0),stor:String(p.storStock||0),cost:String(p.cost||""),barPar:String(p.barPar||0),storPar:String(p.storPar||0),unit:p.unit||"btl",notes:p.notes||"",barPos:String(p.barPos||999)});}}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{p.name}</div>
              <div style={{fontSize:10,color:"#888"}}>{p.supplier} · {p.size}{p.cost>0?` · $${p.cost}`:""}</div>
              {p.ruleNote&&<div style={{fontSize:10,color:"#b45309",marginTop:1}}>{p.ruleNote}</div>}
              {p.notes&&<div style={{fontSize:10,color:"#3b82f6",marginTop:1}}>📝 {p.notes}</div>}
            </div>
            <div style={{textAlign:"right"}}><span style={S.badge(s)}>{s.label}</span>
              {!ed&&<div style={{fontSize:10,color:"#888",marginTop:2}}>B:{p.barStock||0} S:{p.storStock||0} = {total}</div>}
            </div>
          </div>
          {ed&&<div style={{marginTop:8}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
              <div><div style={S.lbl}>Bar</div><input type="number" inputMode="decimal" value={ef.bar} onChange={e=>setEf({...ef,bar:e.target.value})} style={S.inp} autoFocus/></div>
              <div><div style={S.lbl}>Storage</div><input type="number" inputMode="decimal" value={ef.stor} onChange={e=>setEf({...ef,stor:e.target.value})} style={S.inp}/></div>
              <div><div style={S.lbl}>Cost</div><input type="number" inputMode="decimal" value={ef.cost} onChange={e=>setEf({...ef,cost:e.target.value})} style={{...S.inp,width:70}}/></div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
              <div><div style={S.lbl}>Bar par</div><input type="number" inputMode="numeric" value={ef.barPar} onChange={e=>setEf({...ef,barPar:e.target.value})} style={{...S.inp,width:50}}/></div>
              <div><div style={S.lbl}>Stor par</div><input type="number" inputMode="numeric" value={ef.storPar} onChange={e=>setEf({...ef,storPar:e.target.value})} style={{...S.inp,width:50}}/></div>
              <div><div style={S.lbl}>Position</div><input type="number" inputMode="numeric" value={ef.barPos} onChange={e=>setEf({...ef,barPos:e.target.value})} style={{...S.inp,width:50}}/></div>
              <div><div style={S.lbl}>Unit</div><input value={ef.unit} onChange={e=>setEf({...ef,unit:e.target.value})} style={{...S.inp,width:50}}/></div>
            </div>
            <div style={{marginBottom:8}}><div style={S.lbl}>Notes</div><input value={ef.notes} onChange={e=>setEf({...ef,notes:e.target.value})} style={S.inpF}/></div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{
                const pos=parseInt(ef.barPos)||999;const oldPos=products.find(x=>x.id===p.id)?.barPos||999;
                let np2=products.map(pr=>pr.id===p.id?{...pr,barStock:parseFloat(ef.bar)||0,storStock:parseFloat(ef.stor)||0,cost:parseFloat(ef.cost)||pr.cost,barPar:parseFloat(ef.barPar)??pr.barPar,storPar:parseFloat(ef.storPar)??pr.storPar,unit:ef.unit||pr.unit,notes:ef.notes!==undefined?ef.notes:pr.notes,barPos:pos}:pr);
                if(pos!==oldPos){
                  np2=np2.map(pr=>{if(pr.id===p.id)return pr;if(pos<oldPos&&pr.barPos>=pos&&pr.barPos<oldPos)return{...pr,barPos:pr.barPos+1};if(pos>oldPos&&pr.barPos>oldPos&&pr.barPos<=pos)return{...pr,barPos:pr.barPos-1};return pr;});
                }
                setProducts(np2);save({products:np2});setEditId(null);setEf({});
              }} style={S.btn}>Save</button>
              <button onClick={e=>{e.stopPropagation();setEditId(null);}} style={S.btnO}>Cancel</button>
            </div>
          </div>}
        </div>;})}
    </>}

    {/* === ORDERS === */}
    {view==="orders"&&<>
      <p style={{fontSize:12,color:"#888",marginBottom:10}}>Based on total stock (bar + storage). Tap 📋 to copy order text.</p>
      {Object.entries(supGroups).sort(([,a],[,b])=>b.filter(x=>x.status.level==="red").length-a.filter(x=>x.status.level==="red").length).map(([sup,items])=>{const info=suppliers[sup];return<div key={sup} style={{marginBottom:14,borderRadius:10,overflow:"hidden",border:"1px solid #e0e0e0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#1B2A4A",color:"#fff",borderRadius:"10px 10px 0 0"}}>
          <div><div style={{fontSize:14,fontWeight:600}}>{sup}</div><div style={{fontSize:10,opacity:0.8}}>By: {info?.dl||"—"} · Del: {info?.del||"—"}</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{background:"#fff",color:"#1B2A4A",borderRadius:12,padding:"2px 8px",fontSize:11,fontWeight:600}}>{items.length}</div>
            <button onClick={()=>{navigator.clipboard.writeText(generateOrderText(sup));setCopiedSup(sup);setTimeout(()=>setCopiedSup(""),2000);}} style={{background:"#fff3",border:"1px solid #fff5",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#fff",cursor:"pointer"}}>{copiedSup===sup?"Copied!":"📋"}</button>
          </div>
        </div>
        {items.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",borderBottom:"1px solid #f0f0f0"}}><div><div style={{fontSize:12,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"#888"}}>{p.size} · Total: {R((p.barStock||0)+(p.storStock||0))}</div></div><span style={S.badge(p.status)}>{p.status.label}</span></div>)}
        {info?.ph&&<div style={{padding:"6px 14px",fontSize:11,color:"#888",background:"#fafafa"}}>{info.ph}{info.ct?` (${info.ct})`:""}</div>}
      </div>;})}
      {Object.keys(supGroups).length===0&&<div style={{...S.card,textAlign:"center",color:"#888"}}>Everything's at par!</div>}

      <div style={{...S.card,marginTop:20}}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Receive Delivery</div>
        <select value="" onChange={e=>{if(e.target.value)startDelivery(e.target.value);}} style={{...S.sel,width:"100%"}}><option value="">Select supplier...</option>{Object.keys(suppliers).map(s=><option key={s}>{s}</option>)}</select>
      </div>
    </>}

    {/* === RECIPES === */}
    {view==="recipes"&&<>
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{rEditId?"Edit":"New"} Recipe</div>
        <div style={{marginBottom:8}}><div style={S.lbl}>Drink name</div><input value={rName} onChange={e=>setRName(e.target.value)} style={S.inpF}/></div>
        <div style={S.lbl}>Ingredients</div>
        {rIng.map((ing,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
          <div style={{flex:1}}><SearchSelect items={allIngredients} value={ing.pid} onChange={v=>{const n=[...rIng];n[i].pid=v;setRIng(n);}} placeholder="Search ingredient..."/></div>
          <input type="number" inputMode="decimal" value={ing.oz} onChange={e=>{const n=[...rIng];n[i].oz=e.target.value;setRIng(n);}} style={{...S.inp,width:45}} placeholder="oz"/>
          <span style={{fontSize:11,color:"#888"}}>oz</span>
          {rIng.length>1&&<button onClick={()=>setRIng(rIng.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>×</button>}
        </div>)}
        <button onClick={()=>setRIng([...rIng,{pid:"",oz:""}])} style={{...S.btnO,fontSize:11,marginBottom:10}}>+ ingredient</button>
        <div style={{marginBottom:8}}><div style={S.lbl}>Menu price ($)</div><input type="number" inputMode="decimal" value={rPrice} onChange={e=>setRPrice(e.target.value)} style={{...S.inp,width:80}}/></div>
        <button onClick={saveRecipe} style={S.btn}>{rEditId?"Update":"Save"}</button>
      </div>

      {/* Pricing tool */}
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Drink Pricing Tool</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div><div style={S.lbl}>Bottle cost ($)</div><input type="number" inputMode="decimal" value={dpC} onChange={e=>setDpC(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Bottle oz</div><input type="number" inputMode="decimal" value={dpB} onChange={e=>setDpB(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Pour oz</div><input type="number" inputMode="decimal" value={dpP} onChange={e=>setDpP(e.target.value)} style={S.inpF}/></div>
          <div><div style={S.lbl}>Target %</div><input type="number" inputMode="decimal" value={dpT} onChange={e=>setDpT(e.target.value)} style={S.inpF}/></div>
        </div>
        {dpC&&<div style={{background:"#f0f4ff",borderRadius:8,padding:12}}><div style={{fontSize:11,color:"#888"}}>Cost/drink: ${R((parseFloat(dpC)||0)/(parseFloat(dpB)||1)*(parseFloat(dpP)||1)).toFixed(2)} · {Math.floor((parseFloat(dpB)||1)/(parseFloat(dpP)||1))} drinks/btl</div><div style={{fontSize:28,fontWeight:600}}>Charge: ${dpSug.toFixed(2)}</div></div>}
      </div>

      {recipes.map(r=>{const cost=recipeCost(r);const pour=r.menuPrice>0?R((cost/r.menuPrice)*100):0;const profit=r.menuPrice-cost;const margin=r.menuPrice>0?R((profit/r.menuPrice)*100):0;
        return<div key={r.id} style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600}}>{r.name}</div>
              {r.ingredients.map((ing,i)=>{const p=products.find(x=>x.id===parseInt(ing.pid));const ic=p&&p.cost&&p.ozPerBottle?R(p.cost/p.ozPerBottle*parseFloat(ing.oz)):0;return<div key={i} style={{fontSize:11,color:"#888"}}>{ing.oz}oz {p?.name||"?"}{ic?` ($${ic.toFixed(2)})`:""}</div>;})}
            </div>
            <div style={{textAlign:"right"}}>
              {cost>0&&<div style={{fontSize:18,fontWeight:600}}>${cost.toFixed(2)}</div>}
              {r.menuPrice>0&&<><div style={{fontSize:12,color:"#888"}}>${r.menuPrice} menu</div>
              <div style={{fontSize:13,fontWeight:600,color:pour>25?"#ef4444":"#22c55e"}}>{pour}% pour</div>
              <div style={{fontSize:12,color:"#22c55e"}}>${profit.toFixed(2)} profit ({margin}%)</div></>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>{setREditId(r.id);setRName(r.name);setRIng(r.ingredients.length?r.ingredients:[{pid:"",oz:""}]);setRPrice(String(r.menuPrice||""));}} style={S.btnO}>Edit</button>
            <button onClick={()=>{const nr=recipes.filter(x=>x.id!==r.id);setRecipes(nr);save({recipes:nr});}} style={{...S.btnO,color:"#ef4444"}}>Delete</button>
          </div>
        </div>;})}
    </>}

    {/* === VARIANCE === */}
    {view==="variance"&&<>
      <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Weekly Variance</div>
      {!calcVariance&&<p style={{fontSize:12,color:"#888"}}>Need at least 2 inventory counts to calculate variance. Count each Monday and the app will do the rest.</p>}
      {calcVariance&&<>
        <div style={{...S.card,background:"#f0f4ff"}}>
          <div style={{fontSize:13,fontWeight:600}}>Last count vs Previous</div>
          <div style={{fontSize:11,color:"#888",marginBottom:8}}>{new Date(snapshots[snapshots.length-2]?.date).toLocaleDateString()} → {new Date(snapshots[snapshots.length-1]?.date).toLocaleDateString()}</div>
          <div style={{fontSize:22,fontWeight:600}}>Total cost of usage: ${calcVariance.reduce((t,r)=>t+r.cost,0).toFixed(2)}</div>
        </div>
        {calcVariance.filter(r=>r.usage>0).map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}>
          <div><div style={{fontWeight:500}}>{r.name}</div><div style={{color:"#888"}}>Had: {r.prev}{r.received>0?` + ${r.received} recv'd`:""} → Now: {r.curr}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:600}}>{r.usage} used</div><div style={{color:"#888"}}>${r.cost}</div></div>
        </div>)}
      </>}
    </>}

    {/* === FINANCE === */}
    {view==="finance"&&<>
      <div style={{display:"flex",gap:6,marginBottom:12}}>{[["value","Inventory Value"],["prices","Update Prices"]].map(([t,l])=><button key={t} style={S.nb(finTab===t)} onClick={()=>setFinTab(t)}>{l}</button>)}</div>

      {finTab==="value"&&<>
        <div style={{...S.card,background:"#f0f4ff"}}><div style={{fontSize:13,fontWeight:600}}>Total value</div><div style={{fontSize:32,fontWeight:600}}>${Math.round(totalVal).toLocaleString()}</div><div style={{fontSize:11,color:"#888"}}>{products.filter(p=>p.cost>0).length} costed / {products.filter(p=>p.cost===0&&!p.disc&&p.rule!=="discontinue").length} missing costs</div></div>
        <div style={{fontSize:13,fontWeight:500,margin:"12px 0 8px"}}>All costed items</div>
        {products.filter(p=>p.cost>0).sort((a,b)=>(b.cost*((b.barStock||0)+(b.storStock||0)))-(a.cost*((a.barStock||0)+(a.storStock||0)))).map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><span>{p.name}</span><span style={{fontWeight:600}}>${Math.round(p.cost*((p.barStock||0)+(p.storStock||0)))}</span></div>)}
        {products.filter(p=>p.cost===0&&!p.disc&&p.rule!=="discontinue").length>0&&<>
          <div style={{fontSize:13,fontWeight:500,margin:"16px 0 8px",color:"#ef4444"}}>Missing costs</div>
          {products.filter(p=>p.cost===0&&!p.disc&&p.rule!=="discontinue").map(p=><div key={p.id} style={{padding:"5px 0",borderBottom:"1px solid #f0f0f0",fontSize:12,color:"#ef4444"}}>{p.name} ({p.supplier})</div>)}
        </>}
      </>}

      {finTab==="prices"&&<div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Update price</div>
        <div style={{marginBottom:8}}><SearchSelect items={products.map(p=>({id:p.id,label:`${p.name} (${p.supplier}) ${p.cost?`$${p.cost}`:""}`}))} value={ipProd} onChange={setIpProd} placeholder="Search product..."/></div>
        <div style={{marginBottom:8}}><div style={S.lbl}>New cost ($)</div><input type="number" inputMode="decimal" value={ipCost} onChange={e=>setIpCost(e.target.value)} style={S.inpF}/></div>
        {ipProd&&(()=>{const p=products.find(x=>x.id===parseInt(ipProd));return p?<div style={{fontSize:12,color:"#888",marginBottom:8}}>Current: ${p.cost||"none"} → New: ${ipCost||"?"}</div>:null;})()}
        <button onClick={()=>{
          if(!ipProd||!ipCost)return;
          const np2=products.map(p=>p.id===parseInt(ipProd)?{...p,cost:parseFloat(ipCost)}:p);
          setProducts(np2);const na=addActivity("price_update",`${products.find(p=>p.id===parseInt(ipProd))?.name}: $${ipCost}`);
          save({products:np2,activity:na});setIpProd("");setIpCost("");
        }} style={S.btn}>Update</button>
      </div>}
    </>}

    {/* === ACTIVITY === */}
    {view==="activity"&&<>
      <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Activity</div>
      {activity.length===0&&<p style={{fontSize:12,color:"#888"}}>No activity yet. Start by taking inventory.</p>}
      {[...activity].reverse().slice(0,50).map(a=>{
        const icon=a.type==="inventory"?"📋":a.type==="delivery"?"📦":a.type==="price_update"?"💰":a.type==="toast_import"?"📊":"📝";
        return<div key={a.id} style={{...S.card,padding:10}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:500}}>{icon} {a.type.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</span>
            <span style={{fontSize:11,color:"#888"}}>{new Date(a.date).toLocaleString()}</span>
          </div>
          <div style={{fontSize:12,color:"#555",marginTop:4}}>{a.detail}</div>
        </div>;
      })}

      {snapshots.length>0&&<>
        <div style={{fontSize:13,fontWeight:500,margin:"16px 0 8px"}}>Past Counts ({snapshots.length})</div>
        {[...snapshots].reverse().map(snap=><div key={snap.id}>
          <div style={{...S.card,padding:10,cursor:"pointer"}} onClick={()=>setSnapView(snapView===snap.id?null:snap.id)}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:500}}>{new Date(snap.date).toLocaleDateString()}</span><span style={{fontSize:11,color:"#888"}}>{snap.items.filter(i=>i.total>0).length} items</span></div>
          </div>
          {snapView===snap.id&&<div style={{...S.card,marginTop:-6,maxHeight:400,overflow:"auto"}}>
            {snap.items.filter(i=>i.total>0).sort((a,b)=>b.total-a.total).map(it=>{const p=products.find(x=>x.id===it.id);if(!p)return null;
              return<div key={it.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #f0f0f0",fontSize:11}}><span>{p.name}</span><span style={{color:"#888"}}>B:{it.bar} S:{it.stor} = {R(it.total)}</span></div>;
            })}
          </div>}
        </div>)}
      </>}
    </>}

    {/* === CONTACTS === */}
    {view==="contacts"&&<>
      {Object.entries(suppliers).map(([name,info])=><div key={name} style={S.card}>
        {editSup===name?<>
          <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>{name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div><div style={S.lbl}>Contact</div><input value={supForm.ct||""} onChange={e=>setSupForm({...supForm,ct:e.target.value})} style={S.inpF}/></div>
            <div><div style={S.lbl}>Phone</div><input value={supForm.ph||""} onChange={e=>setSupForm({...supForm,ph:e.target.value})} style={S.inpF}/></div>
            <div><div style={S.lbl}>Deadline</div><input value={supForm.dl||""} onChange={e=>setSupForm({...supForm,dl:e.target.value})} style={S.inpF}/></div>
            <div><div style={S.lbl}>Delivery</div><input value={supForm.del||""} onChange={e=>setSupForm({...supForm,del:e.target.value})} style={S.inpF}/></div>
            <div style={{gridColumn:"span 2"}}><div style={S.lbl}>Portal URL</div><input value={supForm.url||""} onChange={e=>setSupForm({...supForm,url:e.target.value})} style={S.inpF}/></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{const ns={...suppliers,[name]:{...suppliers[name],...supForm}};setSuppliers(ns);save({suppliers:ns});setEditSup(null);}} style={S.btn}>Save</button>
            <button onClick={()=>setEditSup(null)} style={S.btnO}>Cancel</button>
          </div>
        </>:<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{fontSize:14,fontWeight:600}}>{name}</div>
            <button onClick={()=>{setEditSup(name);setSupForm({ct:info.ct,ph:info.ph,dl:info.dl,del:info.del,url:info.url});}} style={{fontSize:11,color:"#3b82f6",background:"none",border:"none",cursor:"pointer"}}>Edit</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"3px 10px",fontSize:12,marginTop:4}}>
            {info.ct&&<><span style={{color:"#888"}}>Contact:</span><span>{info.ct}</span></>}
            {info.ph&&<><span style={{color:"#888"}}>Phone:</span><span>{info.ph}</span></>}
            <span style={{color:"#888"}}>Deadline:</span><span>{info.dl}</span>
            <span style={{color:"#888"}}>Delivery:</span><span>{info.del}</span>
            {info.url&&<><span style={{color:"#888"}}>Portal:</span><span><a href={info.url.startsWith("http")?info.url:`https://${info.url}`} target="_blank" rel="noreferrer" style={{color:"#3b82f6",wordBreak:"break-all"}}>{info.url}</a></span></>}
          </div>
        </>}
      </div>)}
    </>}
  </div>);
}
