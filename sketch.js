// 定義六種樂器圖像與配對資料。
const instruments = [
  { id: 0, name: "吉他", zhuyin: "ㄐㄧˊ ㄊㄚ", icon: "🎸" }, // 吉他名稱、注音與圖像。
  { id: 1, name: "鋼琴", zhuyin: "ㄍㄤ ㄑㄧㄣˊ", icon: "🎹" }, // 鋼琴名稱、注音與圖像。
  { id: 2, name: "小提琴", zhuyin: "ㄒㄧㄠˇ ㄊㄧˊ ㄑㄧㄣˊ", icon: "🎻" }, // 小提琴名稱、注音與圖像。
  { id: 3, name: "爵士鼓", zhuyin: "ㄐㄩㄝˊ ㄕˋ ㄍㄨˇ", icon: "🥁" }, // 爵士鼓名稱、注音與圖像。
  { id: 4, name: "小喇叭", zhuyin: "ㄒㄧㄠˇ ㄌㄚˇ ㄅㄚ", icon: "🎺" }, // 小喇叭名稱、注音與圖像。
  { id: 5, name: "薩克斯風", zhuyin: "ㄙㄚˋ ㄎㄜˋ ㄙ ㄈㄥ", icon: "🎷" } // 薩克斯風名稱、注音與圖像。
];

// 打亂下方文字選項的固定顯示順序。
const optionOrder = [3, 0, 5, 1, 4, 2]; // 保持題目每次開啟一致。
let matches = Array(6).fill(null); // 記錄每張圖卡目前配對的樂器。
let draggingOption = null; // 記錄正在拖曳的文字選項。
let resultVisible = false; // 記錄是否已顯示作答結果。
let applauseStartedAt = 0; // 記錄高分拍手動畫開始時間。

// 建立符合瀏覽器視窗尺寸的全螢幕畫布。
function setup() { // 初始化 p5.js 畫布與頁面顯示方式。
  createCanvas(windowWidth, windowHeight); // 讓畫布填滿目前視窗。
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2)); // 控制高解析螢幕的繪圖效能。
  document.body.style.margin = "0"; // 移除頁面預設外距。
  document.body.style.overflow = "hidden"; // 避免畫布外出現捲動條。
  document.body.style.background = "#f3f8f5"; // 設定與畫布一致的頁面底色。
  textFont("sans-serif"); // 使用系統中文字型繪製介面文字。
  textAlign(LEFT, CENTER); // 設定介面文字的預設對齊方式。
}

// 依視窗大小計算題卡、文字選項與按鈕的位置。
function getLayout() { // 集中管理各尺寸畫面共用的排版數值。
  const compact = height < 600; // 判斷是否需要縮小短畫面的排版。
  const margin = compact ? 14 : Math.max(18, Math.min(56, width * 0.045)); // 依畫面高度與寬度設定安全留白。
  const columns = width >= 1200 ? 6 : width >= 680 || (height < 460 && width >= 320) ? 3 : 2; // 大螢幕六欄、中型與矮手機三欄、一般手機兩欄。
  const rows = Math.ceil(instruments.length / columns); // 計算圖卡與文字選項的列數。
  const cardHeight = compact ? Math.max(34, Math.min(58, height * 0.1)) : columns === 6 ? Math.min(154, height * 0.18) : columns === 3 ? Math.min(104, height * 0.13) : Math.min(76, height * 0.095); // 依裝置與可用高度調整圖卡。
  const optionHeight = compact ? 42 : columns === 2 ? 50 : columns === 3 ? 54 : 58; // 設定文字選項的穩定高度。
  const gap = compact ? 8 : columns === 2 ? 10 : 14; // 設定卡片間距。
  const gridWidth = width - margin * 2; // 計算卡片區域的可用寬度。
  const cardWidth = (gridWidth - gap * (columns - 1)) / columns; // 計算每張卡片的寬度。
  const titleY = compact ? 23 : Math.max(28, margin * 0.72); // 設定標題區的垂直位置。
  const imageLabelY = titleY + (compact ? 43 : 70); // 設定上方圖像選項標題位置。
  const cardY = imageLabelY + (compact ? 17 : 22); // 設定上方圖像卡片起點。
  const cardGridHeight = rows * cardHeight + (rows - 1) * gap; // 計算上方圖卡區總高度。
  const optionsLabelY = cardY + cardGridHeight + (compact ? 12 : 26); // 設定下方文字選項標題位置。
  const optionY = optionsLabelY + (compact ? 16 : 22); // 設定下方文字選項起點。
  const buttonWidth = Math.min(252, width - margin * 2); // 計算交卷按鈕寬度。
  const buttonHeight = compact ? 40 : 48; // 短畫面使用較精簡的按鈕高度。
  const button = { x: (width - buttonWidth) / 2, y: height - margin - buttonHeight, w: buttonWidth, h: buttonHeight }; // 設定底部按鈕位置。
  return { margin, columns, rows, cardHeight, optionHeight, gap, gridWidth, cardWidth, titleY, imageLabelY, cardY, optionsLabelY, optionY, button }; // 回傳本畫面的排版資料。
}

// 繪製整個測驗畫面與拖曳狀態。
function draw() { // 每個影格更新背景、卡片與動畫。
  const layout = getLayout(); // 取得目前視窗的響應式排版。
  drawBackdrop(); // 繪製柔和的底色與裝飾線條。
  drawHeading(layout); // 繪製測驗標題與作答提示。
  drawImageCards(layout); // 繪製上方六張動畫樂器圖卡。
  drawTextOptions(layout); // 繪製下方六個可拖曳的文字選項。
  drawFooter(layout); // 繪製完成進度或交卷按鈕。
  if (draggingOption !== null) drawDragGhost(); // 在指標旁繪製正在拖曳的文字。
  if (resultVisible) drawResult(layout); // 顯示成績與高分拍手效果。
}

// 繪製畫布背景。
function drawBackdrop() { // 用簡潔色塊讓測驗內容保持清楚。
  background("#f3f8f5"); // 設定淡綠白色底色。
  noStroke(); // 移除裝飾圖形的外框。
  fill("#e5f2eb"); // 設定柔和的薄荷綠裝飾色。
  circle(width - 28, 28, 150); // 在右上角繪製不干擾內容的圓形裝飾。
  fill("#fbe9dc"); // 設定柔和的珊瑚色裝飾色。
  circle(18, height - 18, 112); // 在左下角繪製輕量裝飾。
  stroke("#dce9e1"); // 設定細分隔線顏色。
  line(0, 0, width, 0); // 繪製頂端細線。
}

// 繪製測驗標題與說明。
function drawHeading(layout) { // 依照畫面寬度調整標題大小。
  noStroke(); // 移除文字外框。
  fill("#183b32"); // 設定深綠色標題文字。
  textAlign(LEFT, CENTER); // 讓標題靠左對齊。
  textStyle(BOLD); // 使用粗體呈現標題。
  textSize(height < 600 ? 21 : width < 460 ? 25 : 32); // 小螢幕使用較小標題字級。
  text("樂器配對測驗", layout.margin, layout.titleY); // 繪製測驗主標題。
  textStyle(NORMAL); // 還原一般文字樣式。
  fill("#668078"); // 設定提示文字顏色。
  textSize(width < 460 ? 13 : 15); // 依裝置調整提示文字大小。
  text("將下方名稱拖曳到正確的樂器圖像", layout.margin, layout.titleY + (height < 600 ? 26 : 36)); // 繪製拖曳提示。
}

// 繪製上方固定的六張動畫樂器圖卡。
function drawImageCards(layout) { // 以輕微浮動動畫呈現圖像選項。
  drawSectionLabel("樂器圖像", layout.margin, layout.imageLabelY); // 繪製上方區域標題。
  for (let slot = 0; slot < instruments.length; slot += 1) { // 逐一繪製六張圖卡。
    const position = getGridPosition(slot, layout, layout.cardY, layout.cardHeight); // 計算目前圖卡的位置。
    const assigned = matches[slot] !== null; // 判斷這張圖卡是否已有配對。
    const isDropTarget = draggingOption !== null && pointInRect(mouseX, mouseY, position.x, position.y, position.w, position.h); // 判斷拖曳指標是否位於圖卡上。
    noStroke(); // 移除卡片外框的預設線條。
    fill(isDropTarget ? "#d8eee1" : assigned ? "#e8f4ec" : "#ffffff"); // 依配對與拖曳狀態設定卡片底色。
    rect(position.x, position.y, position.w, position.h, 14); // 繪製圓角圖卡。
    stroke(isDropTarget ? "#3e9b70" : assigned ? "#9ac9ad" : "#dce9e1"); // 設定卡片外框顏色。
    strokeWeight(isDropTarget ? 2 : 1); // 拖曳命中時加粗外框。
    noFill(); // 讓外框不覆蓋卡片底色。
    rect(position.x, position.y, position.w, position.h, 14); // 繪製卡片外框。
    noStroke(); // 移除圖像與文字的外框。
    fill("#81978e"); // 設定題號文字顏色。
    textAlign(LEFT, TOP); // 將題號對齊卡片左上角。
    textSize(width < 460 ? 10 : 12); // 設定題號大小。
    text(`NO. ${String(slot + 1).padStart(2, "0")}`, position.x + 12, position.y + 10); // 繪製不提示答案的題號。
    const floatOffset = Math.sin(frameCount * 0.055 + slot * 1.2) * (assigned ? 1 : 3); // 計算樂器圖像的浮動幅度。
    textAlign(CENTER, CENTER); // 讓樂器圖像置中。
    textSize(Math.min(layout.cardHeight * 0.43, layout.cardWidth * 0.34)); // 依卡片大小調整圖像尺寸。
    text(instruments[slot].icon, position.x + position.w / 2, position.y + position.h * 0.53 + floatOffset); // 繪製帶動畫的樂器圖像。
    if (assigned) { // 只有已配對時才顯示答案文字。
      fill("#28674d"); // 設定已配對文字顏色。
      const answer = instruments[matches[slot]]; // 取得已配對的名稱與注音。
      drawNameWithZhuyin(answer, position.x + position.w / 2, position.y + position.h - 15, width < 460 ? 10 : 12); // 並排顯示配對名稱與注音。
    }
  }
}

// 繪製下方六個可拖曳的文字選項。
function drawTextOptions(layout) { // 讓每個文字選項都能重新拖曳調整。
  drawSectionLabel("文字選項", layout.margin, layout.optionsLabelY); // 繪製下方區域標題。
  for (let index = 0; index < optionOrder.length; index += 1) { // 逐一繪製六個文字選項。
    const position = getGridPosition(index, layout, layout.optionY, layout.optionHeight); // 計算目前選項的位置。
    const instrument = instruments[optionOrder[index]]; // 取得目前文字選項對應的樂器。
    const isAssigned = matches.includes(instrument.id); // 判斷目前文字是否已放入圖卡。
    const isDragging = draggingOption === index; // 判斷目前文字是否正在拖曳。
    noStroke(); // 移除選項底色外框。
    fill(isDragging ? "#c8ded2" : isAssigned ? "#e4eee8" : "#ffffff"); // 以底色區分拖曳、已配對與未配對狀態。
    rect(position.x, position.y, position.w, position.h, 12); // 繪製文字選項底板。
    stroke(isAssigned ? "#c2d8cb" : "#dce9e1"); // 設定文字選項外框顏色。
    strokeWeight(1); // 使用一致的細外框。
    noFill(); // 保留底板填色並只繪製外框。
    rect(position.x, position.y, position.w, position.h, 12); // 繪製文字選項外框。
    noStroke(); // 移除文字外框。
    fill(isAssigned ? "#789086" : "#26483e"); // 已配對選項使用較柔和的文字顏色。
    textStyle(isAssigned ? NORMAL : BOLD); // 讓尚未配對的選項更容易辨識。
    drawNameWithZhuyin(instrument, position.x + position.w / 2, position.y + position.h / 2, width < 460 ? 12 : 15); // 繪製可拖曳的樂器名稱與注音。
    textStyle(NORMAL); // 還原一般文字樣式。
  }
}

// 將樂器名稱與較小字級的注音並排置中繪製。
function drawNameWithZhuyin(instrument, centerX, centerY, nameSize) { // 共用於文字選項與配對完成標籤。
  textStyle(BOLD); // 讓樂器名稱清楚易讀。
  textSize(nameSize); // 設定樂器名稱字級。
  const nameWidth = textWidth(instrument.name); // 計算樂器名稱所需寬度。
  textSize(Math.max(9, nameSize * 0.82)); // 放大注音並保留清楚的最小字級。
  const zhuyinWidth = textWidth(instrument.zhuyin); // 計算注音所需寬度。
  const gap = Math.max(4, nameSize * 0.3); // 設定名稱與注音之間的留白。
  const startX = centerX - (nameWidth + gap + zhuyinWidth) / 2; // 計算整組文字的置中起點。
  textAlign(LEFT, CENTER); // 讓名稱與注音由左至右排列。
  textSize(nameSize); // 還原名稱字級。
  text(instrument.name, startX, centerY); // 繪製樂器名稱。
  textSize(Math.max(9, nameSize * 0.82)); // 設定放大後的注音字級。
  text(instrument.zhuyin, startX + nameWidth + gap, centerY); // 在名稱旁繪製注音。
  textStyle(NORMAL); // 還原一般文字樣式。
}

// 繪製區域標題與底部進度。
function drawSectionLabel(label, x, y) { // 使用一致的字級呈現區域標題。
  noStroke(); // 移除標題外框。
  fill("#45685c"); // 設定標題文字顏色。
  textAlign(LEFT, CENTER); // 將標題靠左對齊。
  textStyle(BOLD); // 使用粗體強調區域名稱。
  textSize(width < 460 ? 13 : 15); // 依裝置調整區域標題大小。
  text(label, x, y); // 繪製區域標題。
  textStyle(NORMAL); // 還原一般文字樣式。
}

// 繪製作答進度或交卷按鈕。
function drawFooter(layout) { // 全部配對完成後才開放交卷。
  const completed = matches.filter((value) => value !== null).length; // 計算已完成的配對數量。
  if (completed === instruments.length && !resultVisible) { // 判斷是否可以顯示交卷按鈕。
    const hovered = pointInRect(mouseX, mouseY, layout.button.x, layout.button.y, layout.button.w, layout.button.h); // 判斷指標是否位於按鈕上。
    noStroke(); // 移除按鈕外框。
    fill(hovered ? "#24764f" : "#2f8a5d"); // 依滑鼠位置調整按鈕顏色。
    rect(layout.button.x, layout.button.y, layout.button.w, layout.button.h, 13); // 繪製交卷按鈕。
    fill("#ffffff"); // 設定按鈕文字顏色。
    textAlign(CENTER, CENTER); // 將按鈕文字置中。
    textStyle(BOLD); // 強調交卷操作。
    textSize(16); // 設定按鈕文字大小。
    text("交卷看成績", width / 2, layout.button.y + layout.button.h / 2); // 繪製交卷文字。
    textStyle(NORMAL); // 還原一般文字樣式。
  } else if (!resultVisible) { // 尚未完成時顯示目前進度。
    noStroke(); // 移除進度文字外框。
    fill("#668078"); // 設定進度文字顏色。
    textAlign(CENTER, CENTER); // 將進度文字置中。
    textSize(14); // 設定進度文字大小。
    text(`已完成 ${completed} / ${instruments.length} 題`, width / 2, layout.button.y - 13); // 顯示目前配對進度。
  }
}

// 繪製拖曳中的文字浮層。
function drawDragGhost() { // 讓使用者在拖曳時清楚看見選項。
  const instrument = instruments[optionOrder[draggingOption]]; // 取得目前拖曳的樂器名稱。
  textAlign(CENTER, CENTER); // 將拖曳文字置中。
  textStyle(BOLD); // 強調正在移動的文字。
  textSize(width < 460 ? 16 : 18); // 依畫面調整拖曳文字大小。
  noStroke(); // 移除拖曳文字外框。
  fill("#183b32"); // 設定拖曳文字顏色。
  text(instrument.name, mouseX, mouseY - 20); // 在指標上方繪製拖曳文字。
  textStyle(NORMAL); // 還原一般文字樣式。
}

// 顯示作答成績與高分拍手動畫。
function drawResult(layout) { // 依正確題數計算分數並呈現回饋。
  const correct = matches.reduce((total, answer, slot) => total + (answer === instruments[slot].id ? 1 : 0), 0); // 計算正確配對數量。
  const score = Math.round((correct / instruments.length) * 100); // 將答對比例換算成百分比。
  noStroke(); // 移除遮罩外框。
  fill(20, 42, 34, 150); // 設定半透明深色遮罩。
  rect(0, 0, width, height); // 覆蓋背景以聚焦成績結果。
  const panelWidth = Math.min(420, width - 36); // 計算結果面板的響應式寬度。
  const panelHeight = Math.min(330, height - 48); // 計算結果面板的響應式高度。
  const panelX = (width - panelWidth) / 2; // 計算結果面板的水平位置。
  const panelY = (height - panelHeight) / 2; // 計算結果面板的垂直位置。
  fill("#ffffff"); // 設定結果面板底色。
  rect(panelX, panelY, panelWidth, panelHeight, 22); // 繪製白色圓角成績面板。
  textAlign(CENTER, CENTER); // 將結果文字置中。
  fill("#183b32"); // 設定標題文字顏色。
  textStyle(BOLD); // 強調成績標題。
  textSize(width < 460 ? 23 : 27); // 依裝置調整結果標題大小。
  text(score > 80 ? "太棒了！" : "測驗完成", width / 2, panelY + 54); // 依成績顯示鼓勵文字。
  fill("#2f8a5d"); // 設定分數文字顏色。
  textSize(width < 460 ? 48 : 58); // 使用醒目的分數字級。
  text(`${score}%`, width / 2, panelY + panelHeight * 0.48); // 顯示百分比成績。
  fill("#668078"); // 設定答對題數文字顏色。
  textStyle(NORMAL); // 使用一般字重呈現答對題數。
  textSize(15); // 設定答對題數文字大小。
  text(`答對 ${correct} / ${instruments.length} 題`, width / 2, panelY + panelHeight * 0.68); // 顯示答對題數。
  if (score > 80) drawApplause(panelY, panelHeight); // 超過百分之八十時播放拍手效果。
  const buttonWidth = Math.min(210, panelWidth - 40); // 計算重新作答按鈕寬度。
  const buttonY = panelY + panelHeight - 64; // 計算重新作答按鈕垂直位置。
  fill("#2f8a5d"); // 設定重新作答按鈕顏色。
  rect(width / 2 - buttonWidth / 2, buttonY, buttonWidth, 44, 12); // 繪製重新作答按鈕。
  fill("#ffffff"); // 設定按鈕文字顏色。
  textStyle(BOLD); // 強調重新作答操作。
  textSize(15); // 設定按鈕文字大小。
  text("再玩一次", width / 2, buttonY + 22); // 繪製重新作答文字。
  textStyle(NORMAL); // 還原一般文字樣式。
}

// 繪製短暫的拍手符號與彩紙效果。
function drawApplause(panelY, panelHeight) { // 在高分結果旁呈現歡呼動畫。
  const elapsed = millis() - applauseStartedAt; // 計算拍手動畫已播放的時間。
  const pulse = 1 + Math.sin(frameCount * 0.22) * 0.12; // 計算拍手符號的縮放動畫。
  textAlign(CENTER, CENTER); // 將拍手符號置中。
  textSize(31 * pulse); // 讓拍手符號隨節奏縮放。
  text("👏", width / 2, panelY + panelHeight * 0.28); // 顯示拍手表情。
  if (elapsed < 2800) { // 限制彩紙效果的播放時間。
    for (let piece = 0; piece < 22; piece += 1) { // 繪製多片彩色紙屑。
      const seed = piece * 37.7; // 為每片紙屑建立穩定的動畫差異。
      const travel = (elapsed * (0.045 + (piece % 4) * 0.012) + seed) % 150; // 計算紙屑下落距離。
      const drift = Math.sin(elapsed * 0.004 + seed) * 24; // 計算紙屑左右飄動幅度。
      const colors = ["#f4a261", "#48a985", "#e76f51", "#e9c46a", "#5b9bd5"]; // 定義明亮的彩紙顏色。
      noStroke(); // 移除紙屑外框。
      fill(colors[piece % colors.length]); // 依序選用不同彩紙顏色。
      circle(width / 2 + Math.sin(seed) * 150 + drift, panelY + panelHeight * 0.42 + travel, 6 + piece % 4); // 繪製下落的彩紙。
    }
  }
}

// 計算指定格子的畫布位置。
function getGridPosition(index, layout, startY, itemHeight) { // 讓圖卡與文字選項共用網格排版。
  const column = index % layout.columns; // 計算目前項目所在欄位。
  const row = Math.floor(index / layout.columns); // 計算目前項目所在列。
  return { x: layout.margin + column * (layout.cardWidth + layout.gap), y: startY + row * (itemHeight + layout.gap), w: layout.cardWidth, h: itemHeight }; // 回傳項目的位置與大小。
}

// 判斷座標是否位於指定矩形內。
function pointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) { // 共用於拖放與按鈕命中判斷。
  return pointX >= rectX && pointX <= rectX + rectWidth && pointY >= rectY && pointY <= rectY + rectHeight; // 回傳座標命中結果。
}

// 開始拖曳文字選項或點擊交卷按鈕。
function mousePressed() { // 使用 p5.js 滑鼠事件支援滑鼠與觸控操作。
  if (resultVisible) { // 結果畫面只處理重新作答按鈕。
    const panelWidth = Math.min(420, width - 36); // 重新計算結果面板寬度。
    const panelHeight = Math.min(330, height - 48); // 重新計算結果面板高度。
    const buttonWidth = Math.min(210, panelWidth - 40); // 重新計算重新作答按鈕寬度。
    const buttonY = (height - panelHeight) / 2 + panelHeight - 64; // 重新計算重新作答按鈕位置。
    if (pointInRect(mouseX, mouseY, width / 2 - buttonWidth / 2, buttonY, buttonWidth, 44)) resetQuiz(); // 點擊按鈕後重設測驗。
    return false; // 阻止瀏覽器執行預設觸控行為。
  }
  const layout = getLayout(); // 取得目前畫面的互動區域。
  const complete = matches.every((value) => value !== null); // 判斷六個圖卡是否都已配對。
  if (complete && pointInRect(mouseX, mouseY, layout.button.x, layout.button.y, layout.button.w, layout.button.h)) { // 檢查交卷按鈕是否被點擊。
    resultVisible = true; // 顯示作答成績。
    applauseStartedAt = millis(); // 記錄拍手動畫開始時間。
    return false; // 阻止瀏覽器執行預設觸控行為。
  }
  for (let index = 0; index < optionOrder.length; index += 1) { // 檢查每個文字選項是否被按下。
    const position = getGridPosition(index, layout, layout.optionY, layout.optionHeight); // 取得目前選項的互動範圍。
    if (pointInRect(mouseX, mouseY, position.x, position.y, position.w, position.h)) { // 確認指標命中此選項。
      draggingOption = index; // 設定目前拖曳中的選項。
      return false; // 阻止瀏覽器執行預設觸控行為。
    }
  }
  return false; // 保持畫布拖曳操作的行為一致。
}

// 將拖曳中的文字放入對應圖卡。
function mouseReleased() { // 在放開指標時完成配對。
  if (draggingOption === null || resultVisible) return false; // 沒有拖曳選項時不執行配對。
  const layout = getLayout(); // 取得目前圖卡的互動位置。
  const instrumentId = optionOrder[draggingOption]; // 取得被拖曳文字所代表的樂器編號。
  for (let slot = 0; slot < instruments.length; slot += 1) { // 逐一檢查六張圖卡。
    const position = getGridPosition(slot, layout, layout.cardY, layout.cardHeight); // 取得圖卡的互動範圍。
    if (pointInRect(mouseX, mouseY, position.x, position.y, position.w, position.h)) { // 確認放開位置位於圖卡內。
      matches = matches.map((answer) => answer === instrumentId ? null : answer); // 移除同一文字先前的配對位置。
      matches[slot] = instrumentId; // 將文字配對到目前圖卡。
      break; // 完成配對後停止檢查其他圖卡。
    }
  }
  draggingOption = null; // 清除拖曳狀態。
  return false; // 阻止瀏覽器執行預設觸控行為。
}

// 重新開始一輪測驗。
function resetQuiz() { // 清除配對與成績畫面。
  matches = Array(6).fill(null); // 清空所有圖卡配對。
  draggingOption = null; // 清除拖曳中的文字選項。
  resultVisible = false; // 關閉成績結果畫面。
  applauseStartedAt = 0; // 重設拍手動畫時間。
}

// 視窗尺寸變動時同步調整畫布大小。
function windowResized() { // 支援手機旋轉與瀏覽器視窗縮放。
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整至最新視窗尺寸。
}
