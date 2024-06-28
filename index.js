var M_WIDTH=440, M_HEIGHT=740;
var app ={stage:{},renderer:{}}, game_res, objects={}, game_tick=0, LANG = 0, git_src, world;
var any_dialog_active=0, some_process = {}, game_platform='';
var my_data={opp_id : ''},opp_data={};
var avatar_loader;


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
	{letters:['В','Д','Е','О','Р'],words:['РОД','ВОР','РОВ','ДВОР','ВРЕД','ЕВРО','ВЕДРО','ВЕДРО','ДРЕВО']},
	{letters:['В','К','Р','Т','О'],words:['РОТ','КОТ','ВОР','ТОК','РОК','РОВ','КОРТ','КРОТ','КРОВ']},
	{letters:['Б','К','Р','А','О'],words:['БОК','БАР','РАБ','РАК','БАК','БОР','РОК','БРАК','КОРА','КРАБ']}
];

class letter_button_class extends PIXI.Container{
		
	constructor(){
		
		super();
		
		
		this.shadow=new PIXI.Sprite(gres.letter_button_shadow.texture);
		this.shadow.width=90;
		this.shadow.height=90;
		this.shadow.anchor.set(0.5,0.5);
		
		this.hl=new PIXI.Sprite(gres.letter_button_hl.texture);
		this.hl.width=90;
		this.hl.height=90;
		this.hl.anchor.set(0.5,0.5);
		this.hl.visible=false;
		
		this.bcg=new PIXI.Sprite(gres.letter_button_bcg.texture);
		this.bcg.width=90;
		this.bcg.height=90;
		this.bcg.anchor.set(0.5,0.5);
		
		this.t_letter=new PIXI.BitmapText('А', {fontName: 'mfont',fontSize: 57,align: 'center'});
		this.t_letter.anchor.set(0.5,0.5);
		this.t_letter.tint=0x63472B;
		
		this.checked=0;
		
		this.addChild(this.shadow,this.hl,this.bcg, this.t_letter);
	}
	
}

class word_field_class extends PIXI.Container{
	
	constructor(){
		
		super();
		this.bcg=new PIXI.Sprite(gres.word_bcg3.texture);		
		this.bcg.height=60;
		this.bcg.width=140;
		
		this.word='';
		this.opened=0;
		this.word_len=0;
		
		//это буквы
		this.letters=[]
		for(let i=0;i<5;i++){
			const letter=new PIXI.BitmapText('А', {fontName: 'mfont',fontSize: 40,align: 'center'});
			letter.anchor.set(0.5,0.5);
			letter.y=30;
			letter.x=30+i*40;
			letter.tint=0x63472B;
			letter.visible=false;
			this.letters.push(letter);			
		}
		
		this.addChild(this.bcg,...this.letters);		
	}
	
	open_word(){
		
		const word_len=this.word.length;
		for (let l=0;l<word_len;l++)
			this.letters[l].visible=true;
		this.opened=1;
		sound.play('opened');
		
	}
	
	set_word(word){
		
		this.word=word;
		this.opened=0;
		
		const word_len=word.length;
		this.word_len=word_len;
		
		if (word_len===3){
			this.bcg.width=140;
			this.bcg.texture=gres.word_bcg3.texture			
		}

		if (word_len===4){
			this.bcg.width=180;
			this.bcg.texture=gres.word_bcg4.texture			
		}

		if (word_len===5){
			this.bcg.width=220;
			this.bcg.texture=gres.word_bcg5.texture			
		}
	
		this.letters.forEach(l=>l.visible=false)
		for (let l=0;l<word_len;l++){
			this.letters[l].visible=false;
			this.letters[l].text=word[l];
		}
		
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
	
	any_on : function() {
		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;		
	},
	
	wait(seconds){		
		return this.add(this.empty_spr,{x:[0,1]}, false, seconds,'linear');		
	},
	
	linear: function(x) {
		return x
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeOutBounce: function(x) {
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
	
	easeInCubic: function(x) {
		return x * x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic: function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake : function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
		
	},	
	
	add : function(obj,params,vis_on_end,time,func,block) {
				
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
				if (func === 'ease2back')
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
	
	process: function () {
		
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

game={

	score:0,
	cur_level:0,
	sec_passed:0,
	prv_tm:0,
	letters_num:5,
	word_creation_started:0,
	letters_seq:[],
	dist_traveled:0,
	half_traveled_flag:0,
	start_time:0,
	cur_block:0,
	on:0,

	activate(level_id=0) {			
			
		//this.cur_level=level_id;
		//some_process.game=this.process.bind(game);
		
		//скрвываем сначала все буквы
		objects.letter_buttons.forEach(l=>l.visible=false);
		
		//располагаем кнопки-буквы
		const angle_step=Math.PI*2/this.letters_num;
		const start_angle=Math.PI*2*Math.random();
		const letters_to_play=game_data[this.cur_level].letters.sort(()=>0.5-Math.random());
		for (let i=0;i<this.letters_num;i++){
			const letter=objects.letter_buttons[i];
			letter.visible=true;
			letter.x=objects.letters_area_bcg.x+Math.sin(start_angle+angle_step*i)*95;
			const tar_y=objects.letters_area_bcg.y+Math.cos(start_angle+angle_step*i)*95;
			letter.t_letter.text=letters_to_play[i];
			letter.angle=irnd(-10,10);
			
			anim2.add(letter,{y:[800,tar_y]}, true, 0.5,'easeOutBack');	
		}
		
		//поворачиваем ред бола вертикально
		const cur_angle=objects.red_ball.rotation%(2*Math.PI);
		anim2.add(objects.red_ball,{rotation:[cur_angle,0]}, true, 0.2,'linear');
			
	},
		
	prepare_words(){
		
		//располагаем табло со словами		
		objects.words.forEach(w=>w.visible=false);
		
		const words_to_guess=game_data[this.cur_level].words;
		const num_of_letters=words_to_guess.reduce((acc, curr) => acc + curr.length,0);
		const x_len=Math.round(num_of_letters/2.8);
		
		let end_line_x=0;
		let end_line_y=0;
		let cur_line_chars_num=0;
		let cur_line=0;
		let end_of_field_x=0;
		const word_lines=[[],[],[],[],[],[],[],[],[]];
		for (let i=0;i<words_to_guess.length;i++){
			
			const word=objects.words[i];
			const word_len=words_to_guess[i].length;			
			word.set_word(words_to_guess[i]);
			word.visible=true;
			const line_len_pred=cur_line_chars_num+word_len;
			
			if (line_len_pred>x_len){								
				cur_line_chars_num=word_len;								
				end_line_y+=50;	
				word.x=0;
				end_line_x=word.width;
				cur_line++;				
			}else{				
				cur_line_chars_num+=word_len;								
				word.x=end_line_x;
				end_line_x=word.x+word.width;				
			}
			
			//слова по строкам
			word_lines[cur_line].push(word);
			
			//конец поля со словами
			end_of_field_x=Math.max(end_of_field_x,end_line_x);
						
			word.y=end_line_y;			
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
		const tar_scale=Math.min(440/objects.words_cont.width,270/objects.words_cont.height)
		objects.words_cont.scale_xy=tar_scale;
		objects.words_cont.x=M_WIDTH*0.5-objects.words_cont.width*0.5;
		objects.words_cont.y=180-objects.words_cont.height*0.5;
	},
		
	async goto_next_level(){
		
		this.drop_letters();			
		this.cur_level++;		
		this.move_next(1);

		
	},
	
	drop_letters(){
		
		for (let i=0;i<this.letters_num;i++){
			const letter=objects.letter_buttons[i];
			anim2.add(letter,{y:[letter.y,800]}, false, 0.5,'easeInBack');	
		}
		
	},
	
	area_move(e){
		
		if (!this.word_creation_started) return;
		
		//координаты указателя
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
		const r=objects.letter_buttons[0].bcg.width*0.5;
		const cx=objects.letters_area_bcg.x;
		const cy=objects.letters_area_bcg.y;
		const dx=mx-cx;
		const dy=my-cy;
		const d=Math.sqrt(dx*dx+dy*dy);
		if (d>objects.letters_area_bcg.width*0.5)
			this.area_up();
		
		//ищем пересекающиеся и не выбраные еще буквы
		for (let i=0;i<this.letters_num;i++){
			const letter=objects.letter_buttons[i];
			if (!letter.checked){
				
				const lx=letter.x;
				const ly=letter.y;

				const dx=mx-lx;
				const dy=my-ly;
				const d=Math.sqrt(dx*dx+dy*dy);
				
				if (d<r){
					letter.checked=true;
					letter.hl.visible=true;
					this.letters_seq.push(letter);
					this.add_letter(letter.t_letter.text);
				}				
			}			
		}
			
		//рисуем линию коннектор		
		objects.letter_connect_graph.clear();
		if (!this.word_creation_started) return;
		objects.letter_connect_graph.lineStyle(6, 0xffffff)		
		objects.letter_connect_graph.moveTo(this.letters_seq[0].x, this.letters_seq[0].y);		
		for (let i=1;i<this.letters_seq.length;i++)
			objects.letter_connect_graph.lineTo(this.letters_seq[i].x, this.letters_seq[i].y);
		objects.letter_connect_graph.lineTo(mx, my);
		
	},
	
	area_down(e){
		
		//координаты указателя
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
		const r=objects.letter_buttons[0].bcg.width*0.5;
		
		//ищем пересекающиеся и не выбраные еще буквы
		for (let i=0;i<this.letters_num;i++){
			const letter=objects.letter_buttons[i];
			if (!letter.checked){
				
				const lx=letter.x;
				const ly=letter.y;

				const dx=mx-lx;
				const dy=my-ly;
				const d=Math.sqrt(dx*dx+dy*dy);
				
				if (d<r){
					letter.checked=true;
					letter.hl.visible=true;
					this.letters_seq.push(letter);	
					this.word_creation_started=1;
					this.add_letter(letter.t_letter.text);
					return;
				}				
			}			
		}		
	},
	
	area_up(){
		
		objects.typing_word.text='';
		objects.typing_word_bcg.visible=false;
		this.word_creation_started=0;
		objects.letter_buttons.forEach(l=>{l.checked=0;l.hl.visible=false});
		this.letters_seq=[];
		objects.letter_connect_graph.clear();
		
	},
		
	click(e){
		
		//координаты указателя
		const mx = objects.sack_back.x+this.sack_dir*5;
		const my = 150;
		
		//objects.sack_back.x=mx;
		//objects.sack_front.x=mx;
		
		
		const num_of_ball=d_bodies.length;
		
		for (let i =0;i<num_of_ball;i++){
			const ball_body=d_bodies[i];
			if (!ball_body.isActive()){
				ball_body.setActive(true);
				ball_body.setPosition(planck.Vec2(mx, my));
				ball_body.setLinearVelocity(planck.Vec2(0,0));
				ball_body.setAngularVelocity(0);
				objects.balls[i].x=mx;
				objects.balls[i].y=my;
				objects.balls[i].visible=true;
				objects.balls[i].texture=gres['ball'+irnd(0,6)].texture;
				sound.play('shell');
				return;
			}
			
		}			
		
	},
	
	pause_down(){
		
		if (anim2.any_on()||objects.pause_cont.visible||!this.on) return;		
		this.on=0;
		
		sound.play('click');
		some_process.game=function(){};
		
		//
		objects.lock_screen.visible=true;
		anim2.add(objects.pause_cont,{y:[800,objects.pause_cont.sy]}, true, 0.3,'linear');
		
	},
	
	shuffle(){
		
		//располагаем кнопки-буквы
		const angle_step=Math.PI*2/this.letters_num;
		const start_angle=Math.PI*2*Math.random();
		const shuffled_letters=[0,1,2,3,4].sort(()=>0.5-Math.random());
		for (let i=0;i<this.letters_num;i++){
			const index=shuffled_letters[i];
			const letter=objects.letter_buttons[index];
			const tx=objects.letters_area_bcg.x+Math.sin(start_angle+angle_step*i)*90;
			const ty=objects.letters_area_bcg.y+Math.cos(start_angle+angle_step*i)*90;
			anim2.add(letter,{x:[letter.x,tx],y:[letter.y,ty]}, true, 0.25,'easeInOutCubic');
		}	
		
	},
	
	resume_down(){
		
		if (anim2.any_on()) return;
		
		sound.play('click');
		this.on=1;
		some_process.game=game.process.bind(game);
		
		//
		objects.lock_screen.visible=false;
		anim2.add(objects.pause_cont,{y:[objects.pause_cont.y,800]}, false, 0.3,'linear');
		
	},
		
	process_game(init){
		
		if (init){		
			some_process.game=function(){game.process_game(0)};
			return;
		}
		
	},
	
	process_init(init){
		
		if (init){		
			this.dist_traveled=0;
			this.prepare_words();
			some_process.game=function(){game.process_init(0)};			
			objects.dynamic_cont.x=M_WIDTH;
			objects.parallax_front1.x=0;
			objects.parallax_front2.x=M_WIDTH;
			this.cur_block=0;
			objects.block.text=`${this.cur_block+1}/${game_data.length}`;
			return;
		}
		
		
		objects.parallax_bcg.x-=0.25;
		objects.dynamic_cont.x-=x_spd;
		
		//если проехали сколько надо то начинаем сначала
		if (this.dist_traveled>=440){
			this.process_game(1);		
			this.activate();
		}	
		
	},
	
	move_next(init){
		
		if (init){		
			this.dist_traveled=0;
			this.half_traveled_flag=0;
			some_process.game=function(){game.move_next(0)};
			return;
		}
		
		const x_spd=3;
		const ang_speed=x_spd/25;
		
		this.dist_traveled+=x_spd;
		objects.red_ball.rotation+=ang_speed;
		objects.parallax_front1.x-=x_spd;
		objects.parallax_front2.x-=x_spd;
		
		objects.parallax_bcg.x-=0.25;
		objects.dynamic_cont.x-=x_spd;
		
		if (objects.parallax_front1.x<-440)
			objects.parallax_front1.x=objects.parallax_front2.width+objects.parallax_front2.x;
		
		if (objects.parallax_front2.x<-440)
			objects.parallax_front2.x=objects.parallax_front1.width+objects.parallax_front1.x;

				
		//если проехали сколько надо то начинаем сначала
		if (this.dist_traveled>=880){
			this.process_game(1);		
			this.activate();
		}	
		
		//съедаем фрукты
		for (let bonus of objects.bonuses){
			
			if (bonus.visible){	
				
				const world_x=objects.dynamic_cont.x+bonus.sx+25;
				if (world_x<70)
					bonus.visible=false;	
			}		
		}
		
		
		//событие когда полностью экран скрылся
		if (objects.dynamic_cont.x<-440){			
			objects.dynamic_cont.x=440;					
			if (!this.half_traveled_flag){
				this.half_traveled_flag=1;	
				this.prepare_words();
				this.prepare_bonuses();
				
				this.cur_block++;
				objects.block.text=`${this.cur_block+1}/${game_data.length}`;
			}			
		}		
	},
	
	prepare_bonuses(){		
		

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
		
		for (let word of objects.words)			
			if (word.visible && !word.opened)
				return false;	
		return true;

	},
	
	add_letter(letter){
		
		objects.typing_word.text+=letter;
		objects.typing_word_bcg.width=objects.typing_word.width+40;
		objects.typing_word_bcg.pivot.x=objects.typing_word_bcg.width*0.5;
		objects.typing_word_bcg.visible=true;
		
		//проверяем
		for(let word of objects.words){			
			if (word.visible&&!word.opened){				
				if (word.word===objects.typing_word.text){
					word.open_word();
					this.open_word_anim();
					this.area_up();
					if (this.all_words_opened()){
						this.goto_next_level();
						console.log('complete');
					}
					return;
				}				
			}			
		}


	},
	
	open_word_anim(){
		
		for (let i=0;i<this.letters_seq.length;i++){
			
			const letter=this.letters_seq[i];
			const fly_letter=objects.fly_letters[i];
			
			fly_letter.x=letter.x;
			fly_letter.y=letter.y;
			fly_letter.angle=letter.angle;
			fly_letter.t_letter.text=letter.t_letter.text;
			
			
			anim2.add(fly_letter,{y:[fly_letter.y,200],alpha:[1,0],angle:[fly_letter.angle,0]}, false, 1,'linear');	
			
		}
		
	},
	
	clear(){
		
		//сначала очищаем
		for (let body of s_bodies)	
			world.destroyBody(body);
		s_bodies=[];	
		
		//сначала очищаем
		for (let body of d_bodies)	
			world.destroyBody(body);
		d_bodies=[];
		
		// скрываем все блоки
		objects.blocks.forEach(b=>b.visible=false);
		objects.balls.forEach(b=>b.visible=false);
		
		//мешок
		objects.sack_back.visible=false;
		objects.sack_front.visible=false;
		
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

async function load_resources() {


	//отображаем шкалу загрузки
	document.body.innerHTML = '<style>html,body {margin: 0;padding: 0;height: 100%;}body {display: flex;align-items: center;justify-content: center;background-color: rgba(30,30,130,1);flex-direction: column;}#progressFrame {background: rgb(30, 30, 100);border:1px solid rgb(130, 130, 200);justify-content: flex-start;border-radius: 5px;align-items: center;position: relative;padding: 0 5px;display: none;height: 50px;width: 70%;}#progressBar {border-radius: 5px;background: rgb(80, 80, 180);height: 70%;width: 0%;}</style><div id="progressFrame" style="display: flex;"> <div id="progressBar"></div></div>';

	
	
	git_src=''	
	game_res=new PIXI.Loader();
	game_res.add("m2_font", git_src+"fonts/multiround/font.fnt");
		
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++)
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/ENG/'+load_list[i].name+"."+load_list[i].image_format);		

	//добавляем фоны
	game_res.add('parallax_bcg', git_src+'res/common/parallax_bcg.jpg');
	game_res.add('parallax_front', git_src+'res/common/parallax_front.png');
	
	//прогресс
	game_res.onProgress.add(function(loader, resource) {
		document.getElementById("progressBar").style.width =  Math.round(loader.progress)+"%";
	});
	
	await new Promise((resolve, reject)=> game_res.load(resolve))

	//убираем элементы загрузки
	document.getElementById("progressFrame").outerHTML = "";	
	
	//короткое обращение к ресурсам
	gres=game_res.resources;

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
						
	document.body.style.webkitTouchCallout = "none";
	document.body.style.webkitUserSelect = "none";
	document.body.style.khtmlUserSelect = "none";
	document.body.style.mozUserSelect = "none";
	document.body.style.msUserSelect = "none";
	document.body.style.userSelect = "none";		
								
	await load_resources();	
	
	//создаем приложение пикси и добавляем тень
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});	
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";


	resize();
	window.addEventListener("resize", resize);	
			
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
			
			
	//запускаем главный цикл
	main_loop.run(1);
	
	//это разные события
	document.addEventListener('visibilitychange', vis_change);
		
	//проверяем и включаем музыку
	//music.activate();
		
	//показыаем основное меню
	game.cur_level=0;
	game.process_init(1);

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
		
		//отображаем сцену
		app.renderer.render(app.stage);		
		
		//вызываем следующий фрейм
		requestAnimationFrame(main_loop.run);			

	}	
	
}

