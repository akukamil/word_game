var M_WIDTH=440, M_HEIGHT=740;
var app ={stage:{},renderer:{}}, game_res, objects={}, game_tick=0, LANG = 0, git_src;
var some_process = {}, game_platform='';
var my_data={opp_id : ''},opp_data={};

const game_data=[
	{letters:['В','К','Н','О','Е'],words:['ВЕК','КОН','ВЕКО','ОВЕН','ВЕНОК']},
	{letters:['Б','Л','О','П','Т'],words:['ПОЛ','ЛОБ','ПОТ','ПЛОТ','БОЛТ']},
	{letters:['Б','М','О','Р','Т'],words:['РОТ','ТОМ','БОР','МОР','РОМ','БОРТ']},
	{letters:['Б','Н','О','Р','А'],words:['БАР','РАБ','БОР','НОРА','НАБОР','БАРОН']},
	{letters:['В','Н','С','А','Е'],words:['ВЕС','САН','СЕВ','ВЕНА','ВЕСНА','НАВЕС']},
	{letters:['В','Д','И','Р','О'],words:['ВИД','РОД','ВОР','РОВ','ДВОР','ДИВО','ИРОД']},
	{letters:['В','Г','М','О','Р'],words:['ВОР','РОГ','РОВ','МОР','РОМ','ГРОМ','МОРГ']},
	{letters:['Б','О','Р','С','Т'],words:['РОТ','БОР','СОР','РОСТ','СБОР','БОРТ','СОРТ','ТРОС']},
	{letters:['Б','К','Р','Т','А'],words:['АКТ','БАР','РАБ','РАК','БАК','БРАТ','БРАК','КРАБ']},
	{letters:['В','Д','Е','О','Р'],words:['РОД','ВОР','РОВ','ДВОР','ВРЕД','ЕВРО','ВЕДРО','ДРЕВО']},
	{letters:['В','К','Р','Т','О'],words:['РОТ','КОТ','ВОР','ТОК','РОК','РОВ','КОРТ','КРОТ','КРОВ']},
	{letters:['Б','К','Р','А','О'],words:['БОК','БАР','РАБ','РАК','БАК','БОР','РОК','БРАК','КОРА','КРАБ']}
];

class letter_object_class extends PIXI.Container{
		
	constructor(){
		
		super();
		
		this.letter_text='';
		
		this.shadow=new PIXI.Sprite(gres.big_letter_shadow.texture);
		this.shadow.anchor.set(0.5,0.5);
		
		this.hl=new PIXI.Sprite(gres.letter_button_hl.texture);
		this.hl.anchor.set(0.5,0.5);
		this.hl.visible=false;
		
		this.bcg=new PIXI.Sprite(gres.big_letter_bcg.texture);
		this.bcg.anchor.set(0.5,0.5);
		
		this.bonus=new PIXI.Sprite();
		this.bonus.anchor.set(0.5,0.5);
		this.bonus_type='';
		
		this.letter_sprite=new PIXI.Sprite(gres.letters_textures['А']);
		this.letter_sprite.anchor.set(0.5,0.5);
		this.letter_sprite.width=90;
		this.letter_sprite.height=90;
		this.state='holder';
		
		this.checked=0;
		
		this.addChild(this.shadow,this.hl,this.bcg,this.bonus,this.letter_sprite);
	}
	
	add_bonus(bonus){
		
		this.bonus.visible=true;
		this.bonus_type=bonus;
		
		if (bonus==='note')
			this.bonus.texture=gres.note_bonus_img.texture;
		
		if (bonus==='coin')
			this.bonus.texture=gres.coin_bonus_img.texture;
	}
	
	set_as_holder(){
		
		this.state='holder';
		this.bonus_type='';
		this.shadow.visible=false;
		this.hl.visible=false;
		this.letter_sprite.visible=false;
		this.bcg.texture=gres.letter_holder_img.texture;		
		
	}
	
	set_as_opened_letter(){
				
		this.state='opened';
		this.bcg.texture=gres.fly_button_bcg.texture
		this.hl.visible=true;
		this.bonus.visible=false;
		this.letter_sprite.visible=true;
		
	}
	
	set_letter(letter_text){		
		
		this.letter_text=letter_text;
		this.letter_sprite.texture=gres.letters_textures[letter_text];		
		
	}
	
	open(){
		
		this.set_as_opened_letter();
		anim2.add(this.hl,{alpha:[1,0],scale_xy:[0.5,1.5]}, false, 0.5,'linear');	
	}
	
	open_as_hint(){
		this.state='opened';
		this.letter_sprite.visible=true
		anim2.add(this.hl,{alpha:[1,0],scale_xy:[0.5,1.5]}, false, 0.5,'linear');	
	}
	
}

class word_object_class extends PIXI.Container{
	
	constructor(){
		
		super();
		
		this.word_text='';
		this.opened=0;
		this.word_length=0;
		this.bonus_type='';
		this.bonus_letter_object=0;
		
		//это буквы
		this.letters_objects=[];
		for(let i=0;i<5;i++){			
			
			const letter_object=new letter_object_class();
			letter_object.y=25;
			letter_object.x=25+i*38;
			letter_object.bcg.texture=gres.fly_button_bcg.texture;
			letter_object.width=50;
			letter_object.height=50;
			//letter.tint=0x63472B;
			letter_object.shadow.visible=false;
			letter_object.hl.visible=false;
			letter_object.visible=true;
				
			this.letters_objects.push(letter_object);			
		}
		
		this.addChild(...this.letters_objects);		
	}
	
	open_word(){

		this.letters_objects.forEach(l=>l.open());
	}
	
	add_bonus(bonus){
		
		this.bonus_type=bonus;
		this.bonus_letter_object=this.letters_objects[this.word_length-1];
		this.bonus_letter_object.add_bonus(bonus);
		
	}
	
	prepare(word_text){		
		
		this.opened=0;
		this.visible=true;
		this.bonus_type='';
		this.bonus_letter_object=0;
		
		//запоминаем в форму слово и делаем пустую форму
		this.word_text=word_text;		
		this.word_length=word_text.length;

		//сначала скрываем все буквы
		this.letters_objects.forEach(l=>l.visible=false)
		
		for (let l=0;l<this.word_length;l++){
			this.letters_objects[l].set_as_holder();
			this.letters_objects[l].set_letter(this.word_text[l]);
			this.letters_objects[l].visible=true;			
		}

		
	}
		
}

class anim_object_class extends PIXI.Container{
		
	constructor(){
		super();
		
		this.spr1=new PIXI.Sprite();
		this.spr1.anchor.set(0.5,0.5);
		
		this.spr2=new PIXI.Sprite();
		this.spr2.anchor.set(0.5,0.5);
		
		this.addChild(this.spr1,this.spr2);		
	}	
	
}

irnd = function (min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

anim2={
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	any_on() {
		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;		
	},
	
	wait(seconds){		
		return this.add(this.empty_spr,{x:[0,1]}, false, seconds,'linear');		
	},
	
	linear(x) {
		return x
	},
	
	kill_anim(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad(x) {
		return x * x;
	},
	
	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic(x) {
		return x * x * x;
	},
	
	ease2back(x) {
		return Math.sin(x*Math.PI);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	easeInOutBack(x) {

		return x < 0.5
		  ? (Math.pow(2 * x, 2) * ((this.c2 + 1) * 2 * x - this.c2)) / 2
		  : (Math.pow(2 * x - 2, 2) * ((this.c2 + 1) * (x * 2 - 2) + this.c2) + 2) / 2;
	},
	
	shake(x) {
		
		return Math.sin(x*2 * Math.PI);	
		
		
	},	
	
	add (obj,params,vis_on_end,time,func,block) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);
		/*if (anim3_origin === undefined)
			anim3.kill_anim(obj);*/

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {

				obj.visible = true;
				obj.ready = false;
				
				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back'||func==='shake')
					for (let key in params)
						params[key][1]=params[key][0];					
					
				this.slot[i] = {
					obj: obj,
					block:block===undefined,
					params: params,
					vis_on_end: vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

	},	
	
	process () {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
					
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	}
	
}

anim3={
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},
			
	slots: new Array(20).fill().map(u => ({obj:{},on:0,params_num:0,p_resolve:0,progress:0,vis_on_end:false,blocking:false,tm:0,params:new Array(10).fill().map(u => ({param:'x',s:0,f:0,d:0,func:this.linear}))})),
	
	any_on() {
		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;		
	},
	
	wait(seconds){		
		return this.add(this.empty_spr,{x:[0,1]}, false, seconds,'linear');		
	},
	
	linear(x) {
		return x
	},
	
	kill_anim(obj) {
		
		for (var i=0;i<this.slots.length;i++){
			const slot=this.slots[i];
			if (slot.on&&slot.obj===obj){
				slot.p_resolve(1);
				slot.on=0;				
			}
		}	
	},
	
	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad(x) {
		return x * x;
	},
	
	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic(x) {
		return x * x * x;
	},
	
	ease2back(x) {
		return Math.sin(x*Math.PI);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	easeInOutBack(x) {

		return x < 0.5
		  ? (Math.pow(2 * x, 2) * ((this.c2 + 1) * 2 * x - this.c2)) / 2
		  : (Math.pow(2 * x - 2, 2) * ((this.c2 + 1) * (x * 2 - 2) + this.c2) + 2) / 2;
	},
	
	shake(x) {
		
		return Math.sin(x*2 * Math.PI);	
		
		
	},	
	
	add (obj, inp_params, vis_on_end, time, blocking) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim3.kill_anim(obj);


		let found=false;
		//ищем свободный слот для анимации
		for (let i = 0; i < this.slots.length; i++) {

			const slot=this.slots[i];
			if (slot.on) continue;
			
			found=true;
			
			obj.visible = true;
			obj.ready = false;
					
			//заносим базовые параметры слота
			slot.on=1;
			slot.params_num=Object.keys(inp_params).length;			
			slot.obj=obj;
			slot.vis_on_end=vis_on_end;
			slot.blocking=blocking||false;
			slot.speed=0.01818 / time;
			slot.progress=0;			
			
			//добавляем дельту к параметрам и устанавливаем начальное положение
			let ind=0;
			for (const param in inp_params) {
				
				const s=inp_params[param][0];
				let f=inp_params[param][1];
				const d=f-s;					
				const func=this[inp_params[param][2]];
								
				//для возвратных функцие конечное значение равно начальному что в конце правильные значения присвоить
				if (func === 'ease2back'||func==='shake') f=s;
				
				slot.params[ind].param=param;
				slot.params[ind].s=s;
				slot.params[ind].f=f;
				slot.params[ind].d=d;
				slot.params[ind].func=func;
				ind++;

				//фиксируем начальное значение параметра
				obj[param]=s;
			}
			
			return new Promise(resolve=>{
				slot.p_resolve = resolve;	  		  
			});		
		}

		console.log("Кончились слоты анимации");	
		
		//сразу записываем конечные параметры анимации
		for (let param in params)
			obj[param]=params[param][1];
		obj.visible=vis_on_end;
		obj.alpha = 1;
		obj.ready=true;


	},	
	
	process () {
		
		for (var i = 0; i < this.slots.length; i++) {
			const slot=this.slots[i];
			const obj=slot.obj;
			if (slot.on) {
				
				slot.progress+=slot.speed;		
				
				for (let i=0;i<slot.params_num;i++){
					
					const param_data=slot.params[i];
					const param=param_data.param;
					const s=param_data.s;
					const d=param_data.d;
					const func=param_data.func;
					slot.obj[param]=s+d*func(slot.progress);					
				}
				
				//если анимация завершилась то удаляем слот
				if (slot.progress>=0.999) {
					
					//заносим конечные параметры
					for (let i=0;i<slot.params_num;i++){
						const param=slot.params[i].param;
						const f=slot.params[i].f;
						slot.obj[param]=f;
					}
					
					slot.obj.visible=slot.vis_on_end;
					slot.obj.alpha = 1*slot.vis_on_end;
					
					slot.obj.ready=true;
					slot.p_resolve(1);
					slot.on = 0;
				}
			}			
		}		
	}	
}

sound={	
	
	on : 1,
	
	play(snd_res,is_loop) {
				
		if (!this.on||document.hidden)
			return;
		
		if (!gres[snd_res]?.data)
			return;
		
		gres[snd_res].sound.play({loop:is_loop||false});	
		
	},
	
	switch(){
		
		if (this.on){
			this.on=0;
			objects.sound_switch.texture=gres.switch_off.texture;
			
		} else{
			this.on=1;
			objects.sound_switch.texture=gres.switch_on.texture;
		}	
		sound.play('click');
	}
	
}

music={
	
	on:1,
	
	activate(){
		
		if (!this.on||!gres.music) return;

		if (!gres.music.sound.isPlaying){
			gres.music.sound.play();
			gres.music.sound.loop=true;
		}
	},
	
	switch(){
		
		if (this.on){
			this.on=0;
			gres.music?.sound.stop();
			objects.music_switch.texture=gres.switch_off.texture;
			
		} else{
			this.on=1;
			gres.music?.sound.play();
			objects.music_switch.texture=gres.switch_on.texture;
		}
		sound.play('click');
	}
	
}

auth2 = {
		
	load_script(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
			
	get_random_char() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local(prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name(uid) {
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		
		if (uid !== undefined) {
			
			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);				
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;	
			return rnd_names[e_num1] + name_postfix.substring(0, 3);					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}	
	},	
	
	async get_country_code() {

		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json?token=a3455d3185ba47");
			let resp2 = await resp1.json();			
			country_code = resp2.country || '';			
		} catch(e){}

		return country_code;
		
	},
	
	async get_country_code2() {

		let country_code = ''
		try {
			let resp1 = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=1efc1ba695434f2ab24129a98a72a1d4");
			let resp2 = await resp1.json();			
			country_code = resp2.country_code2 || '';			
		} catch(e){}

		return country_code;
		
	},
	
	search_in_local_storage() {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
		
	async search_in_crazygames(){
		if(!window.CrazyGames.SDK)
			return {};
		
		let token='';
		try{
			token = await window.CrazyGames.SDK.user.getUserToken();
		}catch(e){
			return {};
		}
		const user = window.jwt_decode(token);
		return user || {};
	},
		
	async init() {	
				
		if (game_platform === 'GM') {
			
			try {await this.load_script('https://api.gamemonetize.com/sdk.js')} catch (e) {alert(e)};
			
			window.SDK_OPTIONS = {
				gameId: "itlfj6x5pluki04lefb9z3n73xedj19x",
				onEvent: function (a) {
					switch (a.name) {
						case "SDK_GAME_PAUSE":
						   // pause game logic / mute audio
						   break;
						case "SDK_GAME_START":
						   // advertisement done, resume game logic and unmute audio
						   break;
						case "SDK_READY":
						   // when sdk is ready
						   break;
					}
				}
			
			}
			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GM_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;			
			
		}
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.orig_pic_url = _player.getPhoto('medium');
			
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			
			if (my_data.name === ''){				
				my_data.name = this.get_random_name(my_data.uid);				
			}else{
				my_data.yndx_auth=1;
			}


			
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.orig_pic_url = _player.photo_100;
			
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
			return;
		}
		
		if (game_platform === 'RUSTORE') {	

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('RS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;			
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {			
			
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v2.js')} catch (e) {alert(e)};	
			try {await this.load_script('https://akukamil.github.io/quoridor/jwt-decode.js')} catch (e) {alert(e)};		
			const cg_user_data=await this.search_in_crazygames();			
			my_data.uid = cg_user_data.userId || this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = cg_user_data.username || this.get_random_name(my_data.uid);
			my_data.orig_pic_url = cg_user_data.profilePictureUrl || ('mavatar'+my_data.uid);	
					

			//перезапускаем если авторизация прошла
			
			window.CrazyGames.SDK.user.addAuthListener(function(user){	
				if (user?.id&&user.id!==my_data.uid){
					console.log('user changed',user);
					location.reload();	
				}	
			});

					
			return;
		}
		
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
		}
		
	
	},
	
	get_country_from_name(name){
		
		const have_country_code=/\(.{2}\)/.test(name);
		if(have_country_code)
			return name.slice(-3, -1);
		return '';
		
	}
}

mini_piano={
	
	notes_loader:{},
	midi_number_to_name:{M21:'A0',M22:'Bb0',M23:'B0',M24:'C1',M25:'Db1',M26:'D1',M27:'Eb1',M28:'E1',M29:'F1',M30:'Gb1',M31:'G1',M32:'Ab1',M33:'A1',M34:'Bb1',M35:'B1',M36:'C2',M37:'Db2',M38:'D2',M39:'Eb2',M40:'E2',M41:'F2',M42:'Gb2',M43:'G2',M44:'Ab2',M45:'A2',M46:'Bb2',M47:'B2',M48:'C3',M49:'Db3',M50:'D3',M51:'Eb3',M52:'E3',M53:'F3',M54:'Gb3',M55:'G3',M56:'Ab3',M57:'A3',M58:'Bb3',M59:'B3',M60:'C4',M61:'Db4',M62:'D4',M63:'Eb4',M64:'E4',M65:'F4',M66:'Gb4',M67:'G4',M68:'Ab4',M69:'A4',M70:'Bb4',M71:'B4',M72:'C5',M73:'Db5',M74:'D5',M75:'Eb5',M76:'E5',M77:'F5',M78:'Gb5',M79:'G5',M80:'Ab5',M81:'A5',M82:'Bb5',M83:'B5',M84:'C6',M85:'Db6',M86:'D6',M87:'Eb6',M88:'E6',M89:'F6',M90:'Gb6',M91:'G6',M92:'Ab6',M93:'A6',M94:'Bb6',M95:'B6',M96:'C7',M97:'Db7',M98:'D7',M99:'Eb7',M100:'E7',M101:'F7',M102:'Gb7',M103:'G7',M104:'Ab7',M105:'A7',M106:'Bb7',M107:'B7',M108:'C8'},
	notes_num:0,
	notes_data:[],
	
	async load(file){
		
		const midi = await Midi.fromUrl(`new_midi/${file}`);
		this.notes_data=midi.tracks[0].notes.map(n=>{return {midi:n.midi,time:n.time,on:0}});
		this.notes_num=this.notes_data.length;

		const first_note_time=this.notes_data[0].time;
		this.notes_data.forEach(n=>n.time-=first_note_time);


		//подгружаем ноты которые будут играть и звучать
		if(this.notes_loader['piano']===undefined)
			this.notes_loader['piano']=new PIXI.Loader();
		for (let note_data of this.notes_data){
			const note_ind='M'+note_data.midi;
			const note_name=this.midi_number_to_name[note_ind];
			
			if (this.notes_loader['piano'].resources[note_name]===undefined)
				this.notes_loader['piano'].add(note_name,`acoustic_grand_piano/${note_name}.mp3`);			
		}
		
		await new Promise(resolve=>this.notes_loader['piano'].load(resolve));
		
		//располагаем на панели
		for (let n=0;n<this.notes_num;n++){
			
			const x=n%15;
			const y=Math.floor(n/15);
			const note=objects.notes[n];
			note.x=40+x*25;
			note.y=260+y*35;				

			this.notes_data[n].on=0;
			note.alpha=0.3;				

		}		
	},
	
	update_notes(){
		
		const off_notes=this.notes_data.filter(n=>n.on===0);
		const shuffled_notes=off_notes.sort(()=>0.5-Math.random());
		for (let n=0;n<game.notes_num;n++){
			const random_note=shuffled_notes[n];
			random_note.on=1;			
		}
		
		//обновляем вид нот
		for (let n=0;n<this.notes_num;n++){		

			const note=objects.notes[n];
			const note_on=this.notes_data[n].on
			if(note_on)
				note.alpha=1;
			else
				note.alpha=0.3;
		}	

		game.change_notes(-game.notes_num);
	},
	
	async play(){		
						
						
		for (let i=0;i<this.notes_num;i++){
			const note_data=this.notes_data[i];
			const note_ind='M'+note_data.midi;
			const note_name=this.midi_number_to_name[note_ind];
			const note_time=note_data.time*800;
			
			setTimeout(() => {
				this.play_note(note_name,i);
			}, note_time);
		}
				
	},
	
	play_note(note_name,note_ind){
		
		
		const note_spr=objects.notes[note_ind];
		anim2.add(note_spr,{scale_xy:[1,1.5]}, true, 0.15,'ease2back');		
		
		
		const note_data=this.notes_data[note_ind];
		if (!note_data.on){			
			sound.play('locked');
			return;
		}		
		
		//это источник звука
		const context=PIXI.sound.context.audioContext;
		var source = context.createBufferSource();
		
		source.playbackRate.value=1;
		source.buffer = this.notes_loader['piano'].resources[note_name].sound.media.buffer;			
		source.connect(context.destination);			

		source.start(0);
	},
	
	
	
	
}

game={

	score:0,
	cur_level:0,
	sec_passed:0,
	prv_tm:0,
	letters_num:5,
	word_creation_started:0,
	letters_seq:[],
	start_time:0,
	cur_block:0,
	on:0,
	info_ok_resolver:0,
	level_complete_resolver:0,
	coins_num:0,
	notes_num:0,
		
	async run_world(){		
				
		
		this.cur_level=0;		
		
		//
		objects.t_coins.text=this.coins_num;
		objects.t_notes.text=this.notes_num;
		
		//вытаксиваем уровень----------------------------------------------------
		objects.game_cont.visible=false;
		objects.info_board_cont.x=M_WIDTH;
		anim2.add(objects.info_board_cont,{x:[M_WIDTH,0]}, true, 0.5,'linear');	
		objects.level_info.text=`Уровень ${this.cur_level+1}/${game_data.length}`;
		objects.t_level.text=objects.level_info.text;
				
		//загружаем песню
		await mini_piano.load('143.mid');
				
		for (let i=0;i<game_data.length;i++){
							
			//ждем нажатия кнопки			
			await new Promise(res=>{game.info_ok_resolver=res})
			
			//располагаем слова следующего уровня
			this.prepare_words();
			
			//***********двигаем и показываем игру
			//anim2.add(objects.parallax_bcg,{x:[objects.parallax_bcg.x,objects.parallax_bcg.x-10]}, true, 0.5,'linear');	
			anim2.add(objects.info_board_cont,{x:[0,-M_WIDTH]}, false, 0.5,'linear');	
			await anim2.add(objects.game_cont,{x:[M_WIDTH,0]}, true, 0.5,'linear');	
			
			//показываем буквы
			this.show_letters();
			
			//ждем завершения уровня
			await new Promise(res=>{game.level_complete_resolver=res})
			
			//убираем буквы
			this.drop_letters();
			this.cur_level++;			
			
			//*************двигаем и показываем объявление
			objects.level_info.text=`Уровень ${this.cur_level+1}/${game_data.length}`;
			objects.t_level.text=objects.level_info.text;
			mini_piano.update_notes();
			anim2.add(objects.game_cont,{x:[0,-M_WIDTH]}, false, 0.5,'linear');	
			await anim2.add(objects.info_board_cont,{x:[M_WIDTH,0]}, true, 0.5,'linear');				
						
		}	
		
	},
	
	arrange_notes(){
		
		
		
		
	},
	
	play_note(note){
		
		
		
		
	},

	change_coins(delta){
		
		this.coins_num+=delta;
		objects.t_coins.text=this.coins_num;
		anim2.add(objects.t_coins,{scale_xy:[1,1.5]}, true, 0.5,'ease2back');	
	},
	
	change_notes(delta){
		
		this.notes_num+=delta;
		objects.t_notes.text=this.notes_num;
		anim2.add(objects.t_notes,{scale_xy:[1,1.5]}, true, 0.5,'ease2back');	
	},
	
	show_letters() {			
		
		//скрвываем сначала все буквы
		objects.letter_buttons.forEach(l=>l.visible=false);
		
		//располагаем кнопки-буквы
		const angle_step=Math.PI*2/this.letters_num;
		const start_angle=Math.PI*2*Math.random();
		const letters_to_play=game_data[this.cur_level].letters.sort(()=>0.5-Math.random());
		for (let i=0;i<this.letters_num;i++){
			const letter_object=objects.letter_buttons[i];
			letter_object.visible=true;
			letter_object.x=objects.letters_area_bcg.x+Math.sin(start_angle+angle_step*i)*100;
			const tar_y=objects.letters_area_bcg.y+Math.cos(start_angle+angle_step*i)*100;
		
			letter_object.set_letter(letters_to_play[i]);
			letter_object.angle=irnd(-10,10);
			letter_object.scale_xy=0.7;
		
			anim2.add(letter_object,{y:[800,tar_y]}, true, 0.5,'easeOutBack');	
		}			
	},
		
	prepare_words(){
		
		//сначала убираем все слова
		objects.words_objects.forEach(w=>w.visible=false);
		
		const words_to_guess=game_data[this.cur_level].words;
		const num_of_words=words_to_guess.length;
		const num_of_letters=words_to_guess.reduce((acc, curr) => acc + curr.length,0);
		const x_len=Math.round(num_of_letters/2.9);
		
		let end_line_x=0;
		let end_line_y=0;
		let cur_line_chars_num=0;
		let cur_line=0;
		let end_of_field_x=0;
		const word_lines=[[],[],[],[],[],[],[],[],[]];
		for (let i=0;i<num_of_words;i++){
			
			const word_object=objects.words_objects[i];
			const word_text=words_to_guess[i];
			const word_len=word_text.length;		
			
			word_object.prepare(word_text);
			const line_len_pred=cur_line_chars_num+word_len;
			
			if (line_len_pred>x_len){								
				cur_line_chars_num=word_len;								
				end_line_y+=50;	
				word_object.x=0;
				end_line_x=word_object.width;
				cur_line++;				
			}else{				
				cur_line_chars_num+=word_len;								
				word_object.x=end_line_x;
				end_line_x=word_object.x+word_object.width;				
			}
			
			//слова по строкам
			word_lines[cur_line].push(word_object);
			
			//конец поля со словами
			end_of_field_x=Math.max(end_of_field_x,end_line_x);
						
			word_object.y=end_line_y;			
		}		
		
		//центруем все строки
		for (let r=0;r<cur_line+1;r++){
			
			//конец строки
			const end_of_row_x=Math.max(...word_lines[r].map(w=>{return w.x+w.width}));
			
			//на сколько нужно сдвинуть весь ряд
			const to_shift_x=(end_of_field_x-end_of_row_x)*0.5;
			
			//сдвигаем ряд
			word_lines[r].forEach(w=>w.x+=to_shift_x);			
		}
		objects.words_cont.scale_xy=1;
		
		//масштабируем чтобы вписывалось в экран
		const tar_scale=Math.min(360/objects.words_cont.width,240/objects.words_cont.height)
		objects.words_cont.scale_xy=tar_scale;
		objects.words_cont.x=M_WIDTH*0.5-objects.words_cont.width*0.5;
		objects.words_cont.y=215-objects.words_cont.height*0.5;
		
		
		//добавляем бонусы
		const shuffled_words=[...Array(num_of_words).keys()].sort(()=>0.5-Math.random());		
		objects.words_objects[shuffled_words[0]].add_bonus('coin');
		objects.words_objects[shuffled_words[1]].add_bonus('note');
		
		
		
	},
	
	drop_letters(){
		
		for (let i=0;i<this.letters_num;i++){
			const letter=objects.letter_buttons[i];
			anim2.add(letter,{y:[letter.y,800]}, false, 0.5,'easeInBack');	
		}
		
	},
	
	area_move(e){
		
		if (!this.word_creation_started) return;
		
		//получаем координаты указателя
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
		const r=objects.letter_buttons[0].bcg.width*0.5;
		
		//проверяем если нажали или вышли за пределы зоны------
		const cx=objects.letters_area_bcg.x;
		const cy=objects.letters_area_bcg.y;
		const dx=mx-cx;
		const dy=my-cy;
		const d=Math.sqrt(dx*dx+dy*dy);
		if (d>objects.letters_area_bcg.width*0.5){
			this.area_up();		
			return;
		}

		
		//ищем пересекающиеся и не выбраные еще буквы
		for (let i=0;i<this.letters_num;i++){
			const letter_object=objects.letter_buttons[i];
			if (!letter_object.checked){
				
				const lx=letter_object.x;
				const ly=letter_object.y;

				const dx=mx-lx;
				const dy=my-ly;
				const d=Math.sqrt(dx*dx+dy*dy);
				if (d<r){					
									
					//выделяем выбранную букву-------------
					letter_object.checked=true;
					letter_object.hl.visible=true;
					anim2.add(letter_object,{scale_xy:[0.7,0.9]}, true, 0.15,'ease2back');	
					sound.play('button'+this.letters_seq.length);			
					

					this.letters_seq.push(letter_object);
					this.add_letter(letter_object.letter_text);

				}				
			}			
		}
		
		
			
		//рисуем линию коннектор			
		objects.letter_connect_graph.clear();
		if (!this.word_creation_started||!this.letters_seq.length) return;
		objects.letter_connect_graph.lineStyle(6, 0xffffff)		
		objects.letter_connect_graph.moveTo(this.letters_seq[0].x, this.letters_seq[0].y);		
		for (let i=1;i<this.letters_seq.length;i++)
			objects.letter_connect_graph.lineTo(this.letters_seq[i].x, this.letters_seq[i].y);
		objects.letter_connect_graph.lineTo(mx, my);
		
	},
	
	area_down(e){
		
		this.word_creation_started=1;
		this.area_move(e);

	},
	
	area_up(){	
		
		
		//проверяем есть ли совпадения
		const matched_word_object=objects.words_objects.find(function(w){return w.word_text===objects.typing_word.text&&w.visible});
		
		//проверяем открытое слово
		if (matched_word_object){
			
			if (matched_word_object.opened){
				sound.play('word_opened');
				anim2.add(matched_word_object,{x:[matched_word_object.x,matched_word_object.x+5]}, true, 0.15,'shake');
			}else{
				matched_word_object.opened=1;
				this.open_word_anim(matched_word_object);					
				
			}				
		}

		
		objects.typing_word.text='';
		objects.typing_word_bcg.visible=false;
		this.word_creation_started=0;
		objects.letter_buttons.forEach(l=>{l.checked=0;l.hl.visible=false});
		this.letters_seq=[];
		objects.letter_connect_graph.clear();
		console.log('AREA_UP');	
	},
		

	play_notes_button_down(){
		
		mini_piano.play();
		
	},
	
	shuffle(){
		
		//располагаем кнопки-буквы
		const angle_step=Math.PI*2/this.letters_num;
		const start_angle=Math.PI*2*Math.random();
		const shuffled_letters=[0,1,2,3,4].sort(()=>0.5-Math.random());
		for (let i=0;i<this.letters_num;i++){
			const index=shuffled_letters[i];
			const letter=objects.letter_buttons[index];
			const tx=objects.letters_area_bcg.x+Math.sin(start_angle+angle_step*i)*100;
			const ty=objects.letters_area_bcg.y+Math.cos(start_angle+angle_step*i)*100;
			const cur_ang=letter.angle;
			const tar_ang=irnd(-10,10);
			anim2.add(letter,{x:[letter.x,tx],y:[letter.y,ty],angle:[cur_ang,tar_ang]}, true, 0.25,'easeInOutCubic');
		}	
		
	},
	
	hint_down(){
		
		if (this.coins_num<1) return;
		
		this.change_coins(-1);
		
		for (let word_object of objects.words_objects)	{
			if (word_object.visible && !word_object.opened){
				const first_letter_object=word_object.letters_objects[0];
				if (first_letter_object.state==='holder'){
					first_letter_object.open_as_hint();
					sound.play('hint');
					return;					
				}
			}
		}	
		
	},
			
	next_button_down(){		
		this.info_ok_resolver(1);		
	},	
	
	exit_down(){
		
		if (anim2.any_on()) return;
		
		sound.play('click');
		objects.lock_screen.visible=false;
		
		if (objects.pause_cont.visible)
			anim2.add(objects.pause_cont,{y:[objects.pause_cont.y,800]}, false, 0.3,'linear');
		
		if (objects.game_over_cont.visible)
			anim2.add(objects.game_over_cont,{y:[objects.game_over_cont.y,800]}, false, 0.3,'linear');
		
		if (objects.victory_cont.visible)
			anim2.add(objects.victory_cont,{y:[objects.victory_cont.y,800]}, false, 0.3,'linear');
		
		this.close();
		main_menu.activate();
		
	},
	
	all_words_opened(){
		
		for (let word of objects.words_objects)			
			if (word.visible && !word.opened)
				return false;	
		return true;

	},
	
	add_letter(letter_text){
		
		objects.typing_word.text+=letter_text;
		objects.typing_word_bcg.width=objects.typing_word.width+40;
		objects.typing_word_bcg.pivot.x=objects.typing_word_bcg.width*0.5;
		objects.typing_word_bcg.visible=true;
		
	},
	
	async open_word_anim(word_object){
				
		//буквы летят на места
		for (let i=0;i<this.letters_seq.length;i++){
			
			const letter_object=this.letters_seq[i];
			const fly_letter=objects.fly_letters[i];			
			
			const sx=letter_object.x;
			const sy=letter_object.y;
			const s_angle=letter_object.angle;
			fly_letter.set_letter(letter_object.letter_text);
			
			const cur_scale=letter_object.scale_xy;
			const g_holder_width=word_object.letters_objects[i].width*objects.words_cont.scale_xy;
			
			//определяем глобальное положение целевых букв
			const tar_x=(word_object.letters_objects[i].x+word_object.x)*objects.words_cont.scale_x+objects.words_cont.x;
			const tar_y=(word_object.letters_objects[i].y+word_object.y)*objects.words_cont.scale_y+objects.words_cont.y;
			const tar_scale=objects.words_cont.scale_xy*word_object.letters_objects[i].scale_xy;
			
			anim2.add(fly_letter,{x:[sx,tar_x],y:[sy,tar_y],scale_xy:[cur_scale,tar_scale],alpha:[0.5,1],angle:[s_angle,0]}, true, 0.5,'linear');	
			
		}
		
		sound.play('word_open0');
		await anim2.wait(0.5);
		
		sound.play('word_open');
		
		//убираем летящие буквы и открываем настоящие буквы
		objects.fly_letters.forEach(f=>f.visible=false);
		word_object.open_word();		
	
				
		//дополнительная анимация доски - звездочки вокруг каждой буквы
		for (let i=0;i<word_object.word_text.length;i++){
			const letter_object=objects.fly_letters[i];
			const flash=objects.flashes.find(f=>f.visible===false);
			flash.x=letter_object.x;
			flash.y=letter_object.y;
			flash.angle=irnd(0,360);
			anim2.add(flash,{scale_xy:[0.2, 0.5],alpha:[0.9,0]}, false, 2,'linear');				
		}		
		
		
		//если в слове есть бонус		
		if (word_object.bonus_type) {			
			
			const sx=(word_object.bonus_letter_object.x+word_object.x)*objects.words_cont.scale_x+objects.words_cont.x;
			const sy=(word_object.bonus_letter_object.y+word_object.y)*objects.words_cont.scale_y+objects.words_cont.y;			
			if (word_object.bonus_type==='note') {
				//objects.anim_obj.spr1.texture=gres.white_orb_img.texture;	
				//objects.anim_obj.spr2.texture=gres.note_bonus_img.texture;	
				//anim3.add(objects.anim_obj.spr1,{alpha:[0,1,'ease2back'],angle:[0,1000,'linear']}, false, 1);
				objects.fly_coin.texture=gres.note_bonus_img.texture;
				anim3.add(objects.fly_coin,{x:[sx,360,'linear'],y:[sy,20,'easeInOutCubic'],angle:[0,30,'ease2back'],scale_xy:[0.6,1.2,'ease2back'],alpha:[0.3,1,'ease2back']}, false, 1).then(()=>{
					this.change_notes(3);
				})
			}else{
				//objects.anim_obj.spr1.texture=gres.white_orb_img.texture;	
				//objects.anim_obj.spr2.texture=gres.coin_bonus_img.texture;	
				//anim3.add(objects.anim_obj.spr1,{alpha:[0,1,'ease2back'],angle:[0,1000,'linear']}, false, 1);
				objects.fly_coin.texture=gres.coin_bonus_img.texture;
				anim3.add(objects.fly_coin,{x:[sx,30,'linear'],y:[sy,20,'easeInOutCubic'],angle:[0,30,'ease2back'],scale_xy:[0.6,1.2,'ease2back'],alpha:[0.3,1,'ease2back']}, false, 1).then(()=>{
					this.change_coins(1);
				})
			
			}			
		}
			
		//если все открыто, то завершаем уровень
		if (this.all_words_opened()){
			anim2.add(objects.board_hl,{alpha:[0,1]}, false, 3,'ease2back');	
			anim2.add(objects.anim_frame3,{scale_xy:[0.666, 1],alpha:[0.9,0]}, false, 3,'linear');	
			await anim2.wait(0.5);			
			sound.play('win');
			await anim2.wait(2.5);
			
			this.level_complete_resolver();			
		}

		
	},
	
	async close(){
				
		this.clear();
		
		some_process.game=function(){};
		anim2.add(objects.game_control_cont,{y:[objects.game_control_cont.y,-100]}, false, 0.4,'linear');	
		anim2.add(objects.slots_cont,{y:[objects.slots_cont.y,800]}, false, 0.4,'linear');
		
		main_menu.activate();		
	}
		
}

rules={	
	
	activate(){
		
		//фон
		objects.bcg.texture=gres.rules_bcg.texture;	
		
		objects.lock_screen.visible=true;
		anim2.add(objects.rules,{y:[-800,objects.rules.sy]}, true, 0.35,'linear');	
		
	},
	
	back_button_down(){
		
		if (anim2.any_on()) return;	
		sound.play('click');
		this.close();
		main_menu.activate();		
	},
	
	close(){		
		objects.lock_screen.visible=false;
		anim2.add(objects.rules,{y:[objects.rules.y,800]}, false, 0.35,'linear');			
	}
		
}

main_menu={

	activate() {		
		
		//игровой титл
		objects.bcg.texture=gres.main_menu.texture;	
		anim2.add(objects.logo,{y:[-200,objects.logo.sy]}, true, 0.5,'easeOutBounce');			
		anim2.add(objects.main_buttons_cont,{y:[-600,objects.main_buttons_cont.sy]}, true, 0.5,'easeOutBack');some_process.main_menu=function(){main_menu.process()};

	},

	close() {
		
		some_process.main_menu=function(){};
		anim2.add(objects.logo,{y:[objects.logo.y,-200]}, false, 0.5,'linear');			
		anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.y,1000]}, false, 0.5,'linear');			
	
	},
	
	best_results_down(){
		
		if (anim2.any_on()) return;
		
		sound.play('click');
		this.close();
		best_results.activate();		
	},
	
	level_button_down(){
		if (anim2.any_on()) return;
		
		sound.play('click');
		this.close();
		levels_menu.activate();	
	},
	
	process(){
		
		objects.logo.scale_x=Math.sin(Date.now()*0.004)*0.2+1;
		
	},

	play_down () {

		if (anim2.any_on()) return;		
		
		sound.play('click');
		this.close();
		
		
		const last_level=LEVEL_DATA.findLastIndex(el=>el.opened);
		
		game.activate(last_level);
	},

	rules_button_down(){
		
		if (anim2.any_on()) return;	
		sound.play('click');
		this.close();
		rules.activate();		
	}

}

main_loader={
	
	async load1(){
		
		
		//добавляем фон отдельно
		game_res.add('loader_bcg',git_src+'res/common/loader_bcg_img.jpg');
		game_res.add('game_title',git_src+'res/common/game_title_img.png');	
		game_res.add('progress_bcg',git_src+'res/common/progress_bcg_img.png');
		game_res.add('progress_slider',git_src+'res/common/progress_slider_img.png');
				
		await new Promise(res=>game_res.load(res))
		
		//элементы загрузки
		objects.loader_cont=new PIXI.Container();
				
		objects.bcg=new PIXI.Sprite(gres.loader_bcg.texture);
		objects.bcg.width=460;
		objects.bcg.height=760;
		objects.bcg.x=-10;
		objects.bcg.y=-10;
		
		objects.loader_title=new PIXI.Sprite(gres.game_title.texture);
		objects.loader_title.x=200;
		objects.loader_title.y=220;
		objects.loader_title.anchor.set(0.5,0.5);
		objects.loader_title.width=362;
		objects.loader_title.height=195;
		
		objects.progress_bcg=new PIXI.Sprite(gres.progress_bcg.texture);
		objects.progress_bcg.x=20;
		objects.progress_bcg.y=600;
		objects.progress_bcg.width=360;
		objects.progress_bcg.height=50;
		
		objects.progress_slider=new PIXI.NineSlicePlane(gres.progress_slider.texture,20,20,20,20);
		objects.progress_slider.x=30;
		objects.progress_slider.y=610;
		objects.progress_slider.width=10;
		objects.progress_slider.height=30;
		
		objects.loader_cont.addChild(objects.loader_title,objects.progress_bcg,objects.progress_slider);
		app.stage.addChild(objects.bcg,objects.loader_cont);
		
		
	},
	
	async load2(){
		
		//подпапка с ресурсами
		const lang_pack = ['RUS','ENG'][LANG];	
					
		game_res.add("m2_font", git_src+"fonts/Bahnschrift/font.fnt");
		
		game_res.add('word_open',git_src+'sounds/word_open.mp3');
		game_res.add('word_open0',git_src+'sounds/word_open0.mp3');
		game_res.add('word_opened',git_src+'sounds/word_opened.mp3');
		
		game_res.add('button0',git_src+'sounds/button0.mp3');
		game_res.add('button1',git_src+'sounds/button1.mp3');
		game_res.add('button2',git_src+'sounds/button2.mp3');
		game_res.add('button3',git_src+'sounds/button3.mp3');
		game_res.add('button4',git_src+'sounds/button4.mp3');
		game_res.add('button5',git_src+'sounds/button5.mp3');
		game_res.add('hint',git_src+'sounds/hint.mp3');
		game_res.add('win',git_src+'sounds/win.mp3');
		game_res.add('locked',git_src+'sounds/locked.mp3');
		
		//добавляем из листа загрузки
		for (var i = 0; i < load_list.length; i++)
			if (load_list[i].class === "sprite" || load_list[i].class === "image" )
				game_res.add(load_list[i].name, git_src+'res/RUS/'+load_list[i].name+"."+load_list[i].image_format);	
		
		game_res.onProgress.add(progress);
		function progress(loader, resource) {
			objects.progress_slider.width =  340*loader.progress*0.01;
		}
		
		await new Promise((resolve, reject)=> game_res.load(resolve))
				
				
		//формируем текстуры букв		
		gres.letters_textures = {А:0,Б:0,В:0,Г:0,Д:0,Е:0,Ж:0,З:0,И:0,К:0,Л:0,М:0,Н:0,О:0,П:0,Р:0,С:0,Т:0,У:0,Ф:0,Х:0,Ц:0,Ч:0,Ш:0,Щ:0,Э:0,Ю:0,Я:0};
	   
	   // Define the frame width and height based on the 3x4 grid
		const keys=Object.keys(gres.letters_textures);
		const frameWidth = 135;
		const frameHeight = 135;
		let ind=0;
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 7; col++) {
				const x = col * 135;
				const y = row * 135;

				const frame = new PIXI.Rectangle(x, y, frameWidth, frameHeight);
				const smallTexture = new PIXI.Texture(gres.letters.texture, frame);
				gres.letters_textures[keys[ind]]=smallTexture;
				ind++;
			}
		}	
				
		anim2.add(objects.loader_cont,{alpha:[1,0],y:[0,450]}, false, 1,'easeInCubic');	
		objects.progress_bcg.visible=false;
		objects.progress_slider.visible=false;

	}
	
}

async function define_platform_and_language(env) {
	
	let s = window.location.href;
	
	if (env === 'game_monetize') {
				
		game_platform = 'GM';
		LANG = await language_dialog.show();
		return;
	}
	
	if (s.includes('yandex')||s.includes('app-id=196005')) {
		
		game_platform = 'YANDEX';
		
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else 
			LANG = 1;		
		return;
	}
	
	if (s.includes('vk.com')) {
		game_platform = 'VK';	
		LANG = 0;	
		return;
	}
	
	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = 0;
		return;
	}	

	if (s.includes('rustore')) {
			
		game_platform = 'RUSTORE';	
		LANG = 0;
		return;	
	}	
	
	if (s.includes('crazygames')) {
			
		game_platform = 'CRAZYGAMES';	
		LANG = 0;
		return;
	}
	
	if (s.includes('127.0')) {
			
		game_platform = 'DEBUG';	
		LANG = 0;
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await language_dialog.show();
	


}

function resize() {
	
	const BASE_RATIO=M_WIDTH/M_HEIGHT;
    let vpw = window.innerWidth;  // Width of the viewport
    let vph = window.innerHeight; // Height of the viewport
	const new_ratio=vpw/vph/BASE_RATIO;
	const max_ratio=1;
	const min_ratio=1
	
	if (new_ratio>max_ratio) vpw=max_ratio*vph*BASE_RATIO;	
	if (new_ratio<min_ratio) vph=vpw/BASE_RATIO/min_ratio;		
		
    app.renderer.resize(vpw, vph);
    app.stage.scale.set(vpw / M_WIDTH, vph / M_HEIGHT);
	
}

function vis_change() {

	if (document.hidden === true) {	
		if(game.on)
			game.pause_down();
		PIXI.sound.volumeAll=0;	
	} else {
		PIXI.sound.volumeAll=1;	
	}				
		
}

async function init_game_env(lang) {		
				

	git_src="https://akukamil.github.io/word_game/"
	git_src=""
				
	document.body.style.webkitTouchCallout = "none";
	document.body.style.webkitUserSelect = "none";
	document.body.style.khtmlUserSelect = "none";
	document.body.style.mozUserSelect = "none";
	document.body.style.msUserSelect = "none";
	document.body.style.userSelect = "none";		
								
	//ресурсы и короткое обращение
	game_res=new PIXI.Loader();
	gres=game_res.resources;
	
	await define_platform_and_language();
	
	//подгружаем библиотеку аватаров
	await auth2.load_script('multiavatar.min.js');	
	await auth2.load_script('Midi.js');
	
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;}body {display: flex;align-items:center;justify-content: center;background-color: rgba(41,41,41,1)}</style>';


	//создаем приложение пикси и добавляем тень
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});	
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";

	//запускаем главный цикл
	main_loop.run(1);
	
	//событие по изменению размера окна
	resize();
	window.addEventListener("resize", resize);

	await main_loader.load1();	
	await main_loader.load2();
	
	await auth2.init();	
	
	/*//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({			
			apiKey: "AIzaSyDEQoP_xNrecObpO0sHPOisMsu01JCmP6Q",
			authDomain: "poker-cd9ed.firebaseapp.com",
			databaseURL: "https://poker-cd9ed-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "poker-cd9ed",
			storageBucket: "poker-cd9ed.appspot.com",
			messagingSenderId: "721039342577",
			appId: "1:721039342577:web:808922ef505e8dc148e250"
		});
	}
	//короткое обращение к базе данных
	fbs=firebase.database();
	*/
	
	//доп функция для текста битмап
	PIXI.BitmapText.prototype.set2=function(text,w){		
		const t=this.text=text;
		for (i=t.length;i>=0;i--){
			this.text=t.substring(0,i)
			if (this.width<w) return;
		}	
	}
	
			
	//создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;

        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
		
		
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;

        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }
			
						

	
	//это разные события
	document.addEventListener('visibilitychange', vis_change);
		
	//проверяем и включаем музыку
	//music.activate();
		
	//показыаем основное меню
	game.run_world();

}

main_loop={	
	
	prv_time:0,
	delta:1,
	
	run(){
		
		//пересчитываем параметры фрейма
		const tm=performance.now();
		if (!this.prv_time) this.prv_time=tm-16.666;
		const frame_time=Math.min(100,tm-this.prv_time);
		main_loop.delta=frame_time/16.66666;
		this.prv_time=tm;							

		//обрабатываем мини процессы
		for (let key in some_process) some_process[key](main_loop.delta);	
		
		//обрабатываем анимации
		anim2.process(main_loop.delta);		
		anim3.process(main_loop.delta);		
		
		//отображаем сцену
		app.renderer.render(app.stage);		
		
		//вызываем следующий фрейм
		requestAnimationFrame(main_loop.run);			

	}	
	
}

