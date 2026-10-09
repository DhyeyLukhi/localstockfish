const updateAnalysisPanelWithReview=updateAnalysisPanel;
updateAnalysisPanel=function(){updateAnalysisPanelWithReview();updateMoveReview()};
import { Chess } from 'chess.js';
import './style.css';
import './analysis-overrides.css';

const startPGN = '';
const glyph={w:'♔♕♖♗♘♙',b:'♚♛♜♝♞♟'};
const pieceFiles={k:'K',q:'Q',r:'R',b:'B',n:'N',p:'P'};
const app=document.querySelector('#app');
app.innerHTML=`<header class="topbar"><a class="brand" href="#" aria-label="Stillpoint home"><span class="brand-mark">s.</span><span>STILLPOINT</span></a><div class="privacy"><span class="live-dot"></span> PRIVATE BY DESIGN <i></i> ANALYSIS STAYS ON THIS DEVICE</div><button class="quiet" id="newGame">New analysis <span>↗</span></button></header>
<main id="landing" class="landing"><section class="intro"><div class="eyebrow"><span>01</span> YOUR GAME, UNDERSTOOD</div><h1>See the game<br/>a little <em>closer.</em></h1><p>A considered space for understanding every decision. Your PGN stays on your device, analysed by Stockfish running in your browser.</p></section>
<section class="setup-card"><div class="card-head"><div><div class="eyebrow">START WITH A GAME</div><h2>Bring your PGN</h2></div><span class="step-mark">01 <b>—</b> 03</span></div><label class="sr-only" for="pgn">Paste a PGN game</label><textarea id="pgn" spellcheck="false" placeholder="Paste a PGN to begin…">${startPGN}</textarea><div class="input-foot"><span id="validation" class="valid"><span>✓</span> Valid game format</span><span>PGN · SAN notation</span></div><div class="engine-choices"><div><div class="eyebrow">ENGINE PROFILE</div><div class="profiles"><button class="profile active" data-mode="standard"><span class="radio"></span><span><b>Standard</b><small>Balanced for everyday analysis</small></span><span class="profile-tag">1 THREAD</span></button><button class="profile" data-mode="max"><span class="radio"></span><span><b>Max performance</b><small>Use more of this device's power</small></span><span class="profile-tag">UP TO 4</span></button></div></div></div><button id="prepare" class="primary">Prepare engine <span>→</span></button><div class="card-note"><span class="lock">◈</span> No uploads. No accounts. Just your game and your device.</div></section><footer class="landing-foot"><span>LOCAL ENGINE · STOCKFISH</span><span>MADE FOR THE MOMENTS BETWEEN MOVES</span></footer></main>
<section id="preparing" class="preparing hidden"><div class="prep-orbit"><div class="orbit-ring"></div><div class="orbit-core">♞</div><span class="orbit-node">WASM</span><span class="orbit-node n2">NNUE</span></div><div class="eyebrow">LOCAL STOCKFISH</div><h2 id="prepTitle">Preparing your engine</h2><p id="prepMessage">Checking browser capabilities…</p><div class="prep-meter"><span></span></div><div class="prep-detail"><span id="prepStage">ENGINE · WEBASSEMBLY</span><span id="prepProgress">READY WHEN YOU ARE</span></div><button id="cancelPrep" class="quiet">Cancel</button></section>
<section id="analysis" class="analysis hidden"><div class="analysis-title"><div><div class="eyebrow"><span class="live-dot"></span> LOCAL ANALYSIS <span id="runLabel">· IN PROGRESS</span></div><h1 id="gameTitle">Quietly played</h1></div><div class="analysis-actions"><button id="flip" class="icon-btn" aria-label="Flip board">↻</button><button id="back" class="quiet">← Edit PGN</button></div></div><div class="dashboard"><div class="board-column"><div class="player-bar"><span class="avatar black">♟</span><span id="blackName">Black</span><span class="player-rating">ENGINE VIEW</span></div><div class="board-shell"><div class="evaluation"><div class="eval-fill"></div><span id="evalText">0.00</span></div><div id="board" class="board" role="grid" aria-label="Chess board"></div></div><div class="player-bar bottom"><span class="avatar white">♙</span><span id="whiteName">White</span><span class="player-rating">YOU</span></div><div class="board-coords"><button id="firstMove">|‹</button><button id="prevMove">‹</button><span id="movePosition">START POSITION</span><button id="nextMove">›</button><button id="lastMove">›|</button></div></div><aside class="side-panel"><div class="panel-tabs"><button class="tab active">OVERVIEW</button><span class="analysis-count" id="analysisCount">0 / 0</span></div><div class="score-card"><div class="score-head"><span>ACCURACY</span><span id="accuracyState">ESTIMATING</span></div><div class="accuracy-pair"><div><strong id="whiteAccuracy">—</strong><small>WHITE</small></div><div><strong id="blackAccuracy">—</strong><small>BLACK</small></div></div><div class="accuracy-track"><i></i><i></i></div></div><div class="move-quality"><div class="section-label">MOVE QUALITY</div><div class="quality-grid"><div class="quality-item"><i class="q best"></i><span>Best</span><b id="count-best">0</b></div><div class="quality-item"><i class="q excellent"></i><span>Excellent</span><b id="count-excellent">0</b></div><div class="quality-item"><i class="q good"></i><span>Good</span><b id="count-good">0</b></div><div class="quality-item"><i class="q inaccuracy"></i><span>Inaccuracy</span><b id="count-inaccuracy">0</b></div><div class="quality-item"><i class="q mistake"></i><span>Mistake</span><b id="count-mistake">0</b></div><div class="quality-item"><i class="q blunder"></i><span>Blunder</span><b id="count-blunder">0</b></div></div></div><div class="move-section"><div class="section-label">MOVES <span id="moveCount">0 PLIES</span></div><div id="moves" class="moves"></div></div><div class="engine-status"><span class="live-dot"></span><div><b id="engineStatus">Engine ready</b><small id="engineDetail">Stockfish · browser worker</small></div><span id="depth">—</span></div></aside></div></section>
<div id="toast" role="status" class="toast"></div>`;

const $=selector=>document.querySelector(selector);
$('.brand-mark').textContent='b.';
$('.brand').setAttribute('aria-label','Brilliancy home');
$('.brand span:last-child').textContent='BRILLIANCY';
function buildAnalysisLayout(){const analysis=$('#analysis'),dashboard=analysis.querySelector('.dashboard'),boardColumn=analysis.querySelector('.board-column'),sidePanel=analysis.querySelector('.side-panel'),analysisTitle=analysis.querySelector('.analysis-title'),flip=$('#flip'),actions=analysis.querySelector('.analysis-actions'),tabs=sidePanel.querySelector('.panel-tabs'),count=$('#analysisCount'),engine=sidePanel.querySelector('.engine-status'),moveSection=sidePanel.querySelector('.move-section'),accuracy=sidePanel.querySelector('.score-card'),quality=sidePanel.querySelector('.move-quality'),qualityGrid=quality.querySelector('.quality-grid'),boardToolbar=document.createElement('div'),status=document.createElement('div'),reviewMain=document.createElement('div'),overview=document.createElement('section'),heading=document.createElement('div'),columnHead=document.createElement('div');flip.className='board-flip';flip.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM12 5v14M8 9l-2 2 2 2M16 15l2-2-2-2"/></svg><span>Flip board</span>';boardToolbar.className='board-toolbar';boardToolbar.append(flip);boardColumn.insertBefore(boardToolbar,boardColumn.querySelector('.board-shell'));$('#back').remove();actions.remove();status.className='analysis-status';status.append(engine,count);analysisTitle.append(status);tabs.remove();sidePanel.className='review-area';reviewMain.className='review-main';reviewMain.append(moveSection,accuracy);overview.className='overview-panel';heading.className='overview-heading';heading.innerHTML='<span class="section-label">OVERVIEW</span><span>WHITE &nbsp; BLACK</span>';overview.append(heading,quality);quality.className='overview-quality';columnHead.className='overview-column-head';columnHead.innerHTML='<span>MOVE</span><span>WHITE</span><span>BLACK</span>';const rows=[...qualityGrid.querySelectorAll('.quality-item')].map(item=>{const key=item.querySelector('b').id.replace('count-',''),row=document.createElement('div');row.className=`overview-row quality-${key}`;row.innerHTML=`<span>${item.querySelector('span').textContent}</span><b id="count-white-${key}">0</b><b id="count-black-${key}">0</b>`;return row});qualityGrid.className='overview-grid';qualityGrid.replaceChildren(columnHead,...rows);sidePanel.replaceChildren(reviewMain,overview);dashboard.replaceChildren(boardColumn,sidePanel);}
buildAnalysisLayout();
addMoveReviewLayout();
$('.board-column').insertBefore($('.board-toolbar'),$('.board-shell'));
function addMoveReviewLayout(){
	const sidePanel=$('.review-area'),reviewMain=sidePanel.querySelector('.review-main'),overview=sidePanel.querySelector('.overview-panel'),accuracy=sidePanel.querySelector('.score-card'),review=document.createElement('section'),overviewArea=document.createElement('div');
	review.className='move-review';
	review.innerHTML='<div class="move-review-head"><span class="section-label">MOVE REVIEW</span><span id="reviewState">SELECT A MOVE</span></div><div class="review-details"><div class="review-entry"><span>CURRENT MOVE</span><strong id="reviewMove">—</strong><span id="reviewBadge" class="review-badge"><i aria-hidden="true"></i><b id="reviewLabel">—</b></span></div><div class="review-divider"></div><div class="review-entry best-entry"><span>BEST MOVE</span><strong id="reviewBest">—</strong></div></div>';
	const boardColumn=$('.board-column'),boardToolbar=boardColumn.querySelector('.board-toolbar');
	boardToolbar.querySelector('button').setAttribute('aria-label','Flip board');
	boardToolbar.querySelector('button').title='Flip board';
	boardColumn.querySelector('.board-coords').append(boardToolbar);
	reviewMain.append(review);
	overviewArea.className='overview-area';
	overviewArea.append(overview,accuracy);
	sidePanel.append(overviewArea);
	const grid=overview.querySelector('.overview-grid'),columnHead=grid.querySelector('.overview-column-head');
	const labels=[['brilliant','Brilliant'],['great','Great'],['best','Best'],['excellent','Excellent'],['good','Good'],['inaccuracy','Inaccuracy'],['mistake','Mistake'],['miss','Miss'],['blunder','Blunder']];
	const rows=labels.map(([key,label])=>{
		const row=document.createElement('div');
		row.className=`overview-row quality-${key}`;
		row.innerHTML=`<span>${label}</span><b id="count-white-${key}">0</b><b id="count-black-${key}">0</b>`;
		return row
	});
	grid.replaceChildren(columnHead,...rows)
}
function updateMoveReview(){
	const move=history[index-1],result=analyses[index-1],badge=$('#reviewBadge'),state=$('#reviewState');
	$('#reviewMove').textContent=move?.san||'—';
	$('#reviewBest').textContent='—';
	if(!move){
		state.textContent='SELECT A MOVE';
		badge.className='review-badge';
		$('#reviewLabel').textContent='—';
		return
	}
	if(!result){
		state.textContent=workingIndex===index-1?'ANALYZING':'PENDING';
		badge.className='review-badge pending';
		$('#reviewLabel').textContent=workingIndex===index-1?'Analyzing':'Pending';
		return
	}
	const labels={brilliant:'Brilliant',great:'Great',best:'Best',excellent:'Excellent',good:'Good',inaccuracy:'Inaccuracy',mistake:'Mistake',miss:'Miss',blunder:'Blunder'};
	state.textContent='ANALYSED';
	badge.className=`review-badge quality-${result.classification}`;
	$('#reviewLabel').textContent=labels[result.classification]||result.classification;
	const best=result.bestMove||'',played=`${move.from}${move.to}${move.promotion||''}`,playedIsBest=result.playedIsBest??best===played;
	if(best&&!playedIsBest){
		try{
			const position=new Chess(positions[index-1]),bestMove=position.move({from:best.slice(0,2),to:best.slice(2,4),...(best.length>4?{promotion:best[4]}:{})});
			$('#reviewBest').textContent=bestMove?.san||best
		}catch{$('#reviewBest').textContent=best}
	}else if(playedIsBest){
		$('#reviewBest').textContent='--'
	}
}
document.addEventListener('keydown',event=>{if($('#analysis').classList.contains('hidden')||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selectMove(index+(event.key==='ArrowRight'?1:-1))}});
let history=[],positions=[],index=0,flipped=false,worker=null,mode='standard',analyses=[],analysisQueue=[],active=false,ready=false,lastMove=null,workingIndex=-1,searchStage='',interrupted=false,channel=null,channelControl=null,channelBytes=null,bestPositionInfo=null,latestInfo=null,searchDepth=14,lastInfoRender=0;
const config={priorityPlies:8,profiles:{standard:{depth:14,threads:1,hash:64},max:{depth:20,threads:4,hash:256}}};
const squares=()=>{const base=Array.from({length:64},(_,i)=>`${'abcdefgh'[i%8]}${8-Math.floor(i/8)}`);return flipped?base.reverse():base};
function parseGame(raw){try{const game=new Chess();game.loadPgn(raw,{strict:false});const moves=game.history({verbose:true});if(!moves.length)throw Error('Add at least one chess move to analyse.');const replay=new Chess(),positions=[replay.fen()];moves.forEach(move=>{replay.move(move);positions.push(replay.fen())});return {moves,positions,headers:game.getHeaders()}}catch(error){throw new Error(/Add at least/.test(error.message)?error.message:'That PGN could not be read. Check the move notation and try again.')}}
function validate(){try{parseGame($('#pgn').value);$('#validation').className='valid';$('#validation').innerHTML='<span>✓</span> Valid game format';$('#prepare').disabled=false}catch(error){$('#validation').className='invalid';$('#validation').innerHTML='<span>!</span> '+error.message;$('#prepare').disabled=true}}
function renderBoard(){
	const board=$('#board'),game=new Chess(positions[index]||new Chess().fen()),matrix=game.board(),king=game.isCheck()?matrix.flatMap((row,r)=>row.map((piece,f)=>piece?.type==='k'&&piece.color===game.turn()?`${'abcdefgh'[f]}${8-r}`:null)).find(Boolean):null,mate=game.isCheckmate();
	board.innerHTML='';
	squares().forEach((square,i)=>{
		const file=square.charCodeAt(0)-97,rank=Number(square[1])-1,piece=matrix[7-rank]?.[file],element=document.createElement('button');
		element.className='square '+((file+rank)%2?'dark':'light');
		element.setAttribute('role','gridcell');
		element.setAttribute('aria-label',`${square}${piece?`, ${piece.color==='w'?'white':'black'} ${piece.type}`:''}${square===king?(mate?', checkmate':', in check'):''}`);
		element.dataset.square=square;
		if(lastMove&&(square===lastMove.from||square===lastMove.to))element.classList.add('last');
		if(square===king)element.classList.add(mate?'checkmate':'check');
		if(piece){
			const image=document.createElement('img');
			image.src=`${import.meta.env.BASE_URL}chess-assets/${piece.color==='w'?piece.type.toUpperCase():piece.type}.png`;
			image.alt=`${piece.color==='w'?'White':'Black'} ${piece.type}`;
			image.draggable=false;
			element.append(image)
		}
		if(i%8===0){const coord=document.createElement('span');coord.className='rank-label';coord.textContent=square[1];element.append(coord)}
		if(i>=56){const coord=document.createElement('span');coord.className='file-label';coord.textContent=square[0];element.append(coord)}
		board.append(element)
	})
}
function renderMoves(){const wrap=$('#moves'),fragment=document.createDocumentFragment();wrap.replaceChildren();for(let ply=0;ply<history.length;ply+=2){const row=document.createElement('div');row.className='move-row';const number=document.createElement('span');number.className='move-no';number.textContent=`${String(ply/2+1).padStart(2,'0')}.`;row.append(number);for(let side=0;side<2;side++){const move=history[ply+side];if(!move)continue;const movePly=ply+side,result=analyses[movePly],button=document.createElement('button');button.className='move'+(index===movePly+1?' selected':'')+(workingIndex===movePly?' analysing':'')+(result?` quality-${result.classification}`:'');button.textContent=move.san;button.setAttribute('aria-label',`Move ${movePly+1}, ${move.san}${result?`, ${result.classification}`:', not yet analysed'}`);button.onclick=()=>selectMove(movePly+1,true);row.append(button)}fragment.append(row)}wrap.append(fragment);$('#moveCount').textContent=`${history.length} PLIES`}
function selectMove(next,prioritizeSelection=false){index=Math.max(0,Math.min(history.length,next));lastMove=index?history[index-1]:null;renderBoard();renderMoves();$('#movePosition').textContent=index===0?'START POSITION':`${Math.ceil(index/2)}${index%2?'':'…'} · ${history[index-1].san}`;if(prioritizeSelection&&active&&index>0&&!analyses[index-1])prioritize(index-1);updateAnalysisPanel()}
function accuracyFromLoss(loss){return Math.max(0,Math.min(100,103.1668*Math.exp(-0.04354*Math.max(0,loss*100))-3.1669))}
function classify(loss){if(loss<0.08)return 'best';if(loss<0.2)return 'excellent';if(loss<0.5)return 'good';if(loss<1)return 'inaccuracy';if(loss<2)return 'mistake';return 'blunder'}
function updateAnalysisPanel(){const completed=analyses.filter(Boolean);$('#analysisCount').textContent=`${completed.length} / ${history.length}`;const counts={w:{best:0,excellent:0,good:0,inaccuracy:0,mistake:0,blunder:0},b:{best:0,excellent:0,good:0,inaccuracy:0,mistake:0,blunder:0}};completed.forEach(result=>counts[result.color][result.classification]++);Object.entries(counts).forEach(([color,values])=>Object.entries(values).forEach(([key,value])=>$('#count-'+(color==='w'?'white':'black')+'-'+key).textContent=value));['w','b'].forEach((color,i)=>{const values=completed.filter(result=>result.color===color).map(result=>result.accuracy),accuracy=values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null;$('#'+(color==='w'?'white':'black')+'Accuracy').textContent=accuracy===null?'—':`${accuracy.toFixed(1)}%`;document.querySelectorAll('.accuracy-track i')[i].style.width=`${(accuracy??0)/2}%`});$('#accuracyState').textContent=completed.length===history.length?'FINAL':'ESTIMATING';const current=analyses[index-1];if(current)showEval(current.evaluation,current.mate,positions[index]);}
function showEval(score,mate,fen){const whiteToMove=fen?.split(' ')[1]==='w',whiteScore=score*(whiteToMove?1:-1),whiteMate=mate===null?null:mate*(whiteToMove?1:-1);$('#evalText').textContent=whiteMate!==null?`${whiteMate>0?'+':''}M${whiteMate}`:`${whiteScore>=0?'+':''}${whiteScore.toFixed(2)}`;document.querySelector('.eval-fill').style.height=`${Math.max(4,Math.min(96,50-whiteScore*8))}%`}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3500)}
function show(view){['landing','preparing','analysis'].forEach(id=>$('#'+id).classList.toggle('hidden',id!==view))}
function sendUci(line){if(!channelControl||!channelBytes)return;for(const value of new TextEncoder().encode(line+'\n')){const write=Atomics.load(channelControl,1),next=(write+1)%channelBytes.length;while(next===Atomics.load(channelControl,0)){const read=Atomics.load(channelControl,0);Atomics.wait(channelControl,0,read)}channelBytes[write]=value;Atomics.store(channelControl,1,next);Atomics.notify(channelControl,1)}}
function engineSettings(){const cores=Math.max(1,navigator.hardwareConcurrency||2),memory=Math.max(1,navigator.deviceMemory||4),profile=config.profiles[mode],threads=mode==='max'?Math.max(1,Math.min(profile.threads,cores-1)):1;return {cores,threads,hash:mode==='max'?Math.max(32,Math.min(profile.hash,Math.floor(memory*256))):profile.hash,depth:profile.depth}}
function reset(){if(worker){sendUci('quit');worker.terminate();worker=null}channel=null;channelControl=null;channelBytes=null;active=false;ready=false;show('landing')}
$('#newGame').onclick=reset;$('#cancelPrep').onclick=reset;$('#pgn').addEventListener('input',validate);validate();document.querySelectorAll('.profile').forEach(button=>button.onclick=()=>{document.querySelectorAll('.profile').forEach(item=>item.classList.toggle('active',item===button));mode=button.dataset.mode});$('#flip').onclick=()=>{flipped=!flipped;$('.evaluation').classList.toggle('flipped',flipped);$('.board-column').classList.toggle('flipped',flipped);renderBoard()};$('#firstMove').onclick=()=>selectMove(0);$('#prevMove').onclick=()=>selectMove(index-1);$('#nextMove').onclick=()=>selectMove(index+1);$('#lastMove').onclick=()=>selectMove(history.length);
$('#prepare').onclick=()=>{let parsed;try{parsed=parseGame($('#pgn').value)}catch(error){showToast(error.message);return}positions=parsed.positions;history=parsed.moves;index=0;analyses=Array(history.length).fill(null);analysisQueue=[];flipped=false;$('.evaluation').classList.remove('flipped');$('.board-column').classList.remove('flipped');lastMove=null;const headers=parsed.headers;$('#gameTitle').textContent=headers.Event||'Untitled game';$('#whiteName').textContent=headers.White||'White';$('#blackName').textContent=headers.Black||'Black';$('#prepTitle').textContent='Preparing your engine';$('#prepMessage').textContent='Checking local Stockfish and browser capabilities…';$('#prepStage').textContent='ENGINE · WEBASSEMBLY';$('#prepProgress').textContent='CHECKING LOCAL ASSETS';$('.prep-meter').classList.add('indeterminate');$('.prep-meter span').style.width='';show('preparing');setTimeout(initialize,100)};
async function initialize(){try{if(typeof SharedArrayBuffer==='undefined'||!crossOriginIsolated)throw Error('This browser needs cross-origin isolation for the local threaded engine. Use the supplied Vite server.');for(const asset of [import.meta.env.BASE_URL + 'engine/stockfish.js',import.meta.env.BASE_URL + 'engine/stockfish.wasm',import.meta.env.BASE_URL + 'engine/stockfish.data',import.meta.env.BASE_URL + 'engine/worker.js']){const response=await fetch(asset,{method:'HEAD'});if(!response.ok)throw Error('A local Stockfish asset is missing. Run npm run build:engine first.')}$('#prepTitle').textContent='Initializing Stockfish';$('#prepMessage').textContent='Loading the locally built engine and evaluation network…';$('#prepProgress').textContent='LOCAL ENGINE · INITIALIZING';const settings=engineSettings();searchDepth=settings.depth;channel=new SharedArrayBuffer(8+65536);channelControl=new Int32Array(channel,0,2);channelBytes=new Uint8Array(channel,8);worker=new Worker(import.meta.env.BASE_URL + 'engine/worker.js');worker.onmessage=({data})=>{if(data.type==='loaded'){sendUci('uci')}else if(data.type==='uciok'){sendUci(`setoption name Threads value ${settings.threads}`);sendUci(`setoption name Hash value ${settings.hash}`);sendUci('isready');$('#prepMessage').textContent='Completing the UCI handshake…'}else if(data.type==='ready'){ready=true;$('.prep-meter').classList.remove('indeterminate');$('.prep-meter span').style.width='100%';$('#prepTitle').textContent='Engine ready';$('#prepMessage').textContent=`Stockfish is ready · ${settings.threads} thread${settings.threads===1?'':'s'} · ${settings.cores} logical cores available`;$('#prepProgress').textContent='READY';$('#prepStage').textContent='RUNNING LOCALLY';setTimeout(()=>{show('analysis');renderBoard();renderMoves();active=true;startAnalysis()},250)}else if(data.type==='line')onEngineLine(data.line);else if(data.type==='diagnostic')console.debug('[Stockfish]',data.message);else if(data.type==='error')engineFailure(data.message)};worker.onerror=event=>engineFailure(event.message||'The local Stockfish worker failed to start.');worker.postMessage({type:'init',buffer:channel});setTimeout(()=>{if(!ready&&worker){$('#prepTitle').textContent='Engine initialization is taking longer than expected';$('#prepMessage').textContent='Stockfish is still preparing locally. The evaluation network is large; keep this page open while it finishes.';$('#prepProgress').textContent='INITIALIZING · NO TRANSFER PERCENTAGE AVAILABLE'}},30000)}catch(error){$('#prepTitle').textContent='Could not prepare engine';$('#prepMessage').textContent=error.message;$('#prepProgress').textContent='ENGINE ERROR';showToast(error.message)}}
const onEngineLineBeforeMoveReview=onEngineLine;
onEngineLine=function(line){
	if(!line.startsWith('bestmove')||workingIndex<0||interrupted){onEngineLineBeforeMoveReview(line);return}
	if(searchStage==='best'){
		bestPositionInfo=latestInfo;
		const afterMove=new Chess(positions[workingIndex+1]);
		if(afterMove.isGameOver()){
			const checkmate=afterMove.isCheckmate();
			searchStage='played';
			latestInfo={score:checkmate?-1000:0,mate:checkmate?-1:null,depth:bestPositionInfo?.depth||0,nodes:bestPositionInfo?.nodes||0,pv:[]};
		}
		onEngineLineBeforeMoveReview(line);
		return
	}
	if(searchStage!=='played'){onEngineLineBeforeMoveReview(line);return}
	const ply=workingIndex,bestInfo=bestPositionInfo,playedInfo=latestInfo,move=history[ply],bestMove=bestInfo?.pv?.[0]||null;
	onEngineLineBeforeMoveReview(line);
	const result=analyses[ply];
	if(!result)return;
	const playedUci=`${move.from}${move.to}${move.promotion||''}`,playedIsBest=bestMove===playedUci,bestScore=bestInfo?.score??0,playedScore=playedInfo?.score??0;
	const winLoss=Math.max(0,referenceWinPercent(bestScore*100)-referenceWinPercent(-playedScore*100));
	result.playedIsBest=playedIsBest;
	result.classification=referenceClassification(winLoss,playedIsBest);
	result.accuracy=referenceMoveAccuracy(winLoss);
	renderMoves();
	updateAnalysisPanel()
};
function referenceWinPercent(centipawns){const score=Math.max(-1000,Math.min(1000,centipawns));return 50+50*(2/(1+Math.exp(-0.00368208*score))-1)}
function referenceMoveAccuracy(winPercentLoss){return Math.max(0,Math.min(100,103.1668*Math.exp(-0.04354*Math.max(0,winPercentLoss))-3.1669))}
function referenceClassification(winPercentLoss,playedIsBest){if(playedIsBest)return 'best';if(winPercentLoss<=5)return 'excellent';if(winPercentLoss<=10)return 'good';if(winPercentLoss<=20)return 'inaccuracy';if(winPercentLoss<=35)return 'mistake';return 'blunder'}
function engineFailure(message){console.error('Stockfish worker error:',message);$('#prepTitle').textContent='Could not start engine';$('#prepMessage').textContent='Stockfish could not start. Check the local engine build and browser requirements.';$('#prepProgress').textContent='ENGINE ERROR';$('#engineStatus').textContent='Engine error';showToast(message)}
function startAnalysis(){analysisQueue=Array.from({length:history.length},(_,ply)=>ply);analysisQueue.sort((a,b)=>((a<config.priorityPlies?0:1)-(b<config.priorityPlies?0:1))||a-b);runNext()}
function prioritize(ply){if(workingIndex===ply)return;analysisQueue=analysisQueue.filter(item=>item!==ply);analysisQueue.unshift(ply);if(worker&&workingIndex>=0){analysisQueue.push(workingIndex);interrupted=true;sendUci('stop')}}
function runNext(){if(!active||!ready)return;while(analysisQueue.length&&analyses[analysisQueue[0]])analysisQueue.shift();if(!analysisQueue.length){active=false;$('#runLabel').textContent='· COMPLETE';$('#engineStatus').textContent='Analysis complete';$('#engineDetail').textContent='All moves analysed locally';$('#accuracyState').textContent='FINAL';return}workingIndex=analysisQueue.shift();searchStage='best';interrupted=false;bestPositionInfo=null;latestInfo=null;$('#engineStatus').textContent=`Analysing ${workingIndex+1} / ${history.length}`;renderMoves();sendUci(`position fen ${positions[workingIndex]}`);sendUci(`go depth ${searchDepth}`)}
function parseInfo(line){const depth=Number(line.match(/\bdepth (\d+)/)?.[1]||0),nodes=Number(line.match(/\bnodes (\d+)/)?.[1]||0),cp=line.match(/\bscore cp (-?\d+)/),mate=line.match(/\bscore mate (-?\d+)/),pv=line.match(/\bpv (.+)$/)?.[1]?.split(' ')||[];return {depth,nodes,score:cp?Number(cp[1])/100:mate?Math.sign(Number(mate[1]))*1000:null,mate:mate?Number(mate[1]):null,pv}}
function onEngineLine(line){if(line.startsWith('info depth')){latestInfo=parseInfo(line);const now=performance.now();if(now-lastInfoRender>100){lastInfoRender=now;$('#depth').textContent=`D${latestInfo.depth}`;$('#engineDetail').textContent=`Depth ${latestInfo.depth} · ${latestInfo.nodes.toLocaleString()} nodes`;if((searchStage==='best'&&index===workingIndex)||(searchStage==='played'&&index===workingIndex+1))showEval(latestInfo.score??0,latestInfo.mate,positions[index])}return}if(!line.startsWith('bestmove')||workingIndex<0)return;if(interrupted){workingIndex=-1;searchStage='';runNext();return}if(searchStage==='best'){bestPositionInfo=latestInfo;searchStage='played';latestInfo=null;sendUci(`position fen ${positions[workingIndex+1]}`);sendUci(`go depth ${searchDepth}`);return}const ply=workingIndex,best=bestPositionInfo,played=latestInfo,move=history[ply],loss=Math.max(0,(best?.score??0)+(played?.score??0));analyses[ply]={moveIndex:Math.floor(ply/2),ply,san:move.san,fen:positions[ply+1],evaluation:played?.score??0,mate:played?.mate??null,depth:played?.depth??best?.depth??0,nodes:played?.nodes??best?.nodes??0,bestMove:best?.pv?.[0]||null,pv:best?.pv||[],classification:classify(loss),accuracy:accuracyFromLoss(loss),color:move.color,status:'complete'};workingIndex=-1;searchStage='';renderMoves();updateAnalysisPanel();runNext()}
