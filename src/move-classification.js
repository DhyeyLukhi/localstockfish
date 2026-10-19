import { Chess } from 'chess.js';

const MATERIAL_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function isMaterialSacrifice(fen, pv, color) {
	if (pv.length < 2) return false;

	const game = new Chess(fen);
	const firstMove = playUci(game, pv[0]);
	if (!firstMove) return false;
	if (firstMove.piece === 'p') return false;

	const initialBalance = materialBalance(new Chess(fen), color);
	const afterSacrifice = game.fen();
	let sacrificedPieceTaken = false;
	for (const uci of pv.slice(1, 7)) {
		const move = playUci(game, uci);
		if (!move) break;
		if (move.color !== color && move.to === firstMove.to && move.captured === firstMove.piece) {
			sacrificedPieceTaken = true;
		}
	}

	if (sacrificedPieceTaken && initialBalance - materialBalance(game, color) >= 1.5) return true;

	const offer = new Chess(afterSacrifice);
	for (const capture of offer.moves({ verbose: true })) {
		if (capture.to !== firstMove.to || capture.captured !== firstMove.piece) continue;
		const afterCapture = new Chess(afterSacrifice);
		afterCapture.move(uciMove(`${capture.from}${capture.to}${capture.promotion || ''}`));
		if (initialBalance - materialBalance(afterCapture, color) < 1.5) continue;

		const attackerSquare = capture.to;
		const recaptures = afterCapture.moves({ verbose: true }).filter(move => move.color === color && move.to === attackerSquare);
		const recoveredMaterial = recaptures.some(move => {
			const afterRecapture = new Chess(afterCapture.fen());
			afterRecapture.move(uciMove(`${move.from}${move.to}${move.promotion || ''}`));
			return initialBalance - materialBalance(afterRecapture, color) < 1.5;
		});
		if (!recoveredMaterial) return true;
	}

	return false;
}

export function classifyMove({ loss, playedIsBest, bestScore, secondBestScore, materialSacrifice }) {
	if (playedIsBest) {
		if (loss <= 5 && materialSacrifice) return 'brilliant';
		if (loss <= 5 && Number.isFinite(secondBestScore) && bestScore - secondBestScore >= 0.5) return 'great';
		return 'best';
	}
	if (loss <= 5) return 'excellent';
	if (loss <= 10) return 'good';
	if (loss <= 20) return 'inaccuracy';
	if (loss <= 35) return 'mistake';
	return 'blunder';
}

function uciMove(uci) {
	return {
		from: uci.slice(0, 2),
		to: uci.slice(2, 4),
		...(uci.length > 4 ? { promotion: uci[4] } : {}),
	};
}

function playUci(game, uci) {
	if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) {
		console.warn('Stockfish returned an invalid move in its principal variation:', uci);
		return null;
	}
	const move = uciMove(uci);
	const isLegal = game.moves({ verbose: true }).some(candidate =>
		candidate.from === move.from &&
		candidate.to === move.to &&
		(candidate.promotion || '') === (move.promotion || '')
	);
	if (!isLegal) {
		console.warn('Stockfish returned an illegal move in its principal variation:', uci);
		return null;
	}
	return game.move(move);
}

function materialBalance(game, color) {
	return game.board().flat().reduce((balance, piece) => {
		if (!piece) return balance;
		const value = MATERIAL_VALUE[piece.type];
		return balance + (piece.color === color ? value : -value);
	}, 0);
}
