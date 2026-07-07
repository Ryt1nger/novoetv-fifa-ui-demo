(function (global) {
  'use strict';

  var S = 2; /* dp → px @ 1920 */

  var LABELS = {
    round_of_16: '1/8 финала',
    quarter: '1/4 финала',
    semi: 'Полуфинал',
    final: 'Финал',
    third_place: 'Матч за 3е место'
  };

  function metrics() {
    var cellWidth = 111 * S;
    var cellHeight = 45 * S;
    var verticalGapSmall = 4 * S;
    var verticalGapLarge = 10.5 * S;
    var columnGap = 13 * S;
    var quarterToSemiGap = 17 * S;
    var columnStep = cellWidth + columnGap;
    var pairBarWidth = 2 * S;
    var pairBarHeight = 53 * S;
    var contentTop = 0;
    var leftOuterLeft = 3 * S;
    var finalToQuarterSemiLabelGap = 39 * S;
    var roundLabelToCellGap = 22 * S;
    var roundLabelLineHeight = 12 * S;
    var finalLabelExtraTop = 3 * S;
    var finalCellOffsetTop = 5 * S;
    var thirdPlaceCellOffsetTop = 5 * S;

    var leftColumnLeft = [0, 1, 2].map(function (i) { return leftOuterLeft + columnStep * i; });
    var centerColumnLeft = leftColumnLeft[2] + cellWidth + quarterToSemiGap;
    var rightColumnLeft = [0, 1, 2].map(function (i) {
      return centerColumnLeft + cellWidth + quarterToSemiGap + columnStep * i;
    });

    return {
      cellWidth: cellWidth,
      cellHeight: cellHeight,
      verticalGapSmall: verticalGapSmall,
      verticalGapLarge: verticalGapLarge,
      columnGap: columnGap,
      quarterToSemiGap: quarterToSemiGap,
      columnStep: columnStep,
      pairBarWidth: pairBarWidth,
      pairBarHeight: pairBarHeight,
      contentTop: contentTop,
      leftOuterLeft: leftOuterLeft,
      finalToQuarterSemiLabelGap: finalToQuarterSemiLabelGap,
      roundLabelToCellGap: roundLabelToCellGap,
      roundLabelLineHeight: roundLabelLineHeight,
      finalLabelExtraTop: finalLabelExtraTop,
      finalCellOffsetTop: finalCellOffsetTop,
      thirdPlaceCellOffsetTop: thirdPlaceCellOffsetTop,
      leftColumnLeft: leftColumnLeft,
      centerColumnLeft: centerColumnLeft,
      rightColumnLeft: rightColumnLeft,
      SIDE_ROUND_COUNT: 3
    };
  }

  function pairCenterY(m, topA, topB) {
    return (topA + topB + m.cellHeight) / 2;
  }

  function computePairedColumnTops(m, startTop, pairCount) {
    var tops = [];
    var currentTop = startTop;
    for (var pair = 0; pair < pairCount; pair++) {
      tops[pair * 2] = currentTop;
      tops[pair * 2 + 1] = currentTop + m.cellHeight + m.verticalGapSmall;
      currentTop = tops[pair * 2 + 1] + m.cellHeight + m.verticalGapLarge;
    }
    return tops;
  }

  function computeStackedPairedColumnTops(m, previousRound, pairCount) {
    var pairBlockHeight = m.cellHeight * 2 + m.verticalGapSmall;
    var totalHeight = pairBlockHeight * pairCount + m.verticalGapLarge * (pairCount - 1);
    var previousMin = Math.min.apply(null, previousRound);
    var previousMax = Math.max.apply(null, previousRound) + m.cellHeight;
    var previousCenter = (previousMin + previousMax) / 2;
    var startTop = previousCenter - totalHeight / 2;
    return computePairedColumnTops(m, startTop, pairCount);
  }

  function computeLargeGapColumnTops(m, blockCenterY, blockHeight) {
    blockHeight = blockHeight || (m.cellHeight * 2 + m.verticalGapLarge);
    var tops = [];
    tops[0] = blockCenterY - blockHeight / 2;
    tops[1] = tops[0] + m.cellHeight + m.verticalGapLarge;
    return tops;
  }

  function computeQuarterFinalTops(m, round1) {
    var blockHeight = m.cellHeight * 2 + m.verticalGapLarge;
    var blockCenter = (
      pairCenterY(m, round1[0], round1[1]) + pairCenterY(m, round1[2], round1[3])
    ) / 2;
    return computeLargeGapColumnTops(m, blockCenter, blockHeight);
  }

  function computeSideRoundTops(m) {
    var round0 = computePairedColumnTops(m, m.contentTop, 4);
    var round1 = computeStackedPairedColumnTops(m, round0, 2);
    var round2 = computeQuarterFinalTops(m, round1);
    return [round0, round1, round2];
  }

  function labelTopForCellTop(m, cellTop) {
    return cellTop - m.roundLabelToCellGap - m.roundLabelLineHeight;
  }

  function quarterSemiLabelTop(m, sideRoundTops) {
    return labelTopForCellTop(m, Math.min.apply(null, sideRoundTops[2]));
  }

  function computeFinalTop(m, sideRoundTops) {
    return quarterSemiLabelTop(m, sideRoundTops) - m.finalToQuarterSemiLabelGap - m.cellHeight;
  }

  function placeholderMatch(id, tbd) {
    return { id: id, date: tbd, time: tbd, teamTop: tbd, teamBottom: tbd };
  }

  function buildSideCells(m, isLeft, sideRoundTops, tbd) {
    var cells = [];
    var columnLeft = isLeft ? m.leftColumnLeft : m.rightColumnLeft;
    var sidePrefix = isLeft ? 'left' : 'right';
    for (var round = 0; round < 3; round++) {
      var count = sideRoundTops[round].length;
      var columnIndex = isLeft ? round : (2 - round);
      for (var index = 0; index < count; index++) {
        var id = sidePrefix + '_r' + round + '_' + index;
        cells.push({
          id: id,
          left: columnLeft[columnIndex],
          top: sideRoundTops[round][index],
          match: placeholderMatch(id, tbd)
        });
      }
    }
    return cells;
  }

  function buildCenterCells(m, sideRoundTops, finalTop, thirdPlaceTop, tbd) {
    return [
      { id: 'final', left: m.centerColumnLeft, top: finalTop - m.finalCellOffsetTop, match: placeholderMatch('final', tbd) },
      { id: 'semi_0', left: m.centerColumnLeft, top: sideRoundTops[2][0], match: placeholderMatch('semi_0', tbd) },
      { id: 'semi_1', left: m.centerColumnLeft, top: sideRoundTops[2][1], match: placeholderMatch('semi_1', tbd) },
      { id: 'third_place', left: m.centerColumnLeft, top: thirdPlaceTop - m.thirdPlaceCellOffsetTop, match: placeholderMatch('third_place', tbd) }
    ];
  }

  function addSidePairBars(m, bars, isLeft, round, tops, pairCount) {
    var columnIndex = isLeft ? round : (2 - round);
    var columnLeft = isLeft ? m.leftColumnLeft[columnIndex] : m.rightColumnLeft[columnIndex];
    var barLeft = isLeft ? columnLeft - m.pairBarWidth : columnLeft + m.cellWidth;
    for (var pair = 0; pair < pairCount; pair++) {
      var gapCenterY = tops[pair * 2] + m.cellHeight + m.verticalGapSmall / 2;
      var barTop = gapCenterY - m.pairBarHeight / 2;
      bars.push({ left: barLeft, top: barTop, height: m.pairBarHeight });
    }
  }

  function buildPairBars(m, sideRoundTops) {
    var bars = [];
    addSidePairBars(m, bars, true, 0, sideRoundTops[0], 4);
    addSidePairBars(m, bars, true, 1, sideRoundTops[1], 2);
    addSidePairBars(m, bars, true, 2, sideRoundTops[2], 1);
    addSidePairBars(m, bars, false, 0, sideRoundTops[0], 4);
    addSidePairBars(m, bars, false, 1, sideRoundTops[1], 2);
    addSidePairBars(m, bars, false, 2, sideRoundTops[2], 1);
    return bars;
  }

  function buildLabels(m, sideRoundTops, finalTop, thirdPlaceTop) {
    var qsTop = quarterSemiLabelTop(m, sideRoundTops);
    var labelTopRound1 = labelTopForCellTop(m, Math.min.apply(null, sideRoundTops[1]));
    return [
      { text: LABELS.round_of_16, left: m.leftColumnLeft[1], top: labelTopRound1 },
      { text: LABELS.quarter, left: m.leftColumnLeft[2], top: qsTop },
      { text: LABELS.final, left: m.centerColumnLeft, top: labelTopForCellTop(m, finalTop) + m.finalLabelExtraTop },
      { text: LABELS.semi, left: m.centerColumnLeft, top: qsTop },
      { text: LABELS.third_place, left: m.centerColumnLeft, top: labelTopForCellTop(m, thirdPlaceTop) },
      { text: LABELS.quarter, left: m.rightColumnLeft[0], top: qsTop },
      { text: LABELS.round_of_16, left: m.rightColumnLeft[1], top: labelTopRound1 }
    ];
  }

  function buildLayout(tbd) {
    tbd = tbd || 'Н/Д';
    var m = metrics();
    var sideRoundTops = computeSideRoundTops(m);
    var finalTop = computeFinalTop(m, sideRoundTops);
    var thirdPlaceTop = sideRoundTops[0][sideRoundTops[0].length - 1];
    var cells = []
      .concat(buildSideCells(m, true, sideRoundTops, tbd))
      .concat(buildCenterCells(m, sideRoundTops, finalTop, thirdPlaceTop, tbd))
      .concat(buildSideCells(m, false, sideRoundTops, tbd));
    return {
      metrics: m,
      cells: cells,
      labels: buildLabels(m, sideRoundTops, finalTop, thirdPlaceTop),
      pairBars: buildPairBars(m, sideRoundTops)
    };
  }

  var TABLE_ORDER_TO_CELL = (function () {
    var map = {};
    var i;
    for (i = 0; i < 8; i++) {
      map[i * 2 + 1] = 'left_r0_' + i;
      map[i * 2 + 2] = 'right_r0_' + i;
    }
    for (i = 0; i < 4; i++) {
      map[17 + i * 2] = 'left_r1_' + i;
      map[18 + i * 2] = 'right_r1_' + i;
    }
    for (i = 0; i < 2; i++) {
      map[25 + i * 2] = 'left_r2_' + i;
      map[26 + i * 2] = 'right_r2_' + i;
    }
    map[29] = 'semi_0';
    map[30] = 'semi_1';
    map[31] = 'third_place';
    map[32] = 'final';
    return map;
  })();

  global.FifaBracketLayout = {
    buildLayout: buildLayout,
    TABLE_ORDER_TO_CELL: TABLE_ORDER_TO_CELL,
    LABELS: LABELS
  };
})(typeof window !== 'undefined' ? window : global);
