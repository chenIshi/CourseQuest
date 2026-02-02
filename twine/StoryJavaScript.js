/* CourseQuest v1 - SugarCube Story JavaScript */
(function () {
  "use strict";

  var CQ = {};
  CQ.storageKeys = {
    groupName: "cq.groupName",
    currentNodeId: "cq.currentNodeId"
  };

  CQ.config = {
    stripPunctuation: false,
    collapseWhitespace: true,
    wrongMessage: "感謝您的努力解題！❤️ 再試一試！💪"
  };

  CQ.fullwidthToHalfwidth = function (s) {
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var code = s.charCodeAt(i);
      if (code === 12288) {
        out += " ";
      } else if (code >= 65281 && code <= 65374) {
        out += String.fromCharCode(code - 65248);
      } else {
        out += s.charAt(i);
      }
    }
    return out;
  };

  CQ.normalize = function (input) {
    if (input == null) return "";
    var s = String(input);
    s = CQ.fullwidthToHalfwidth(s);
    if (CQ.config.collapseWhitespace) {
      s = s.replace(/\s+/g, " ");
    }
    s = s.trim();
    s = s.toLowerCase();
    if (CQ.config.stripPunctuation) {
      s = s.replace(/[\.,/#!$%\^&\*;:{}=\-_`~()\[\]\\]/g, "");
    }
    return s;
  };

  CQ.isDigitsOnly = function (s) {
    return /^\d+$/.test(s);
  };

  CQ.splitList = function (value) {
    if (!value) return [];
    return String(value)
      .split("|")
      .map(function (v) { return v.trim(); })
      .filter(function (v) { return v.length > 0; });
  };

  CQ.parseCsv = function (text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var next = text.charAt(i + 1);

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          field += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (ch === "\r") {
        // ignore
      } else {
        field += ch;
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  };

  CQ.loadNodesFromCsv = function (csvText) {
    var rows = CQ.parseCsv(csvText);
    if (!rows.length) return { nodes: {}, order: [] };

    var headers = rows[0].map(function (h) {
      return String(h || "").trim().toLowerCase();
    });

    var nodes = {};
    var order = [];

    for (var r = 1; r < rows.length; r++) {
      var cols = rows[r];
      if (!cols || !cols.length) continue;

      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        var key = headers[c];
        obj[key] = cols[c] != null ? String(cols[c]).trim() : "";
      }

      if (!obj.id) continue;

      nodes[obj.id] = {
        id: obj.id,
        promptHTML: obj.prompt || "",
        inputPlaceholder: obj.placeholder || "",
        answers: CQ.splitList(obj.answers),
        regexAnswers: CQ.splitList(obj.regex),
        onSuccessHTML: obj.onsuccess || "",
        nextId: obj.nextid || ""
      };
      order.push(obj.id);
    }

    return { nodes: nodes, order: order };
  };

  CQ.getCsvText = function () {
    var passage = Story.get("ContentCSV");
    if (!passage) return "";
    return (passage.text || "").trim();
  };

  CQ.init = function () {
    var csvText = CQ.getCsvText();
    var result = CQ.loadNodesFromCsv(csvText);
    CQ.nodes = result.nodes;
    CQ.order = result.order;

    if (State.variables.groupName == null) State.variables.groupName = "";
    if (State.variables.currentNodeId == null) State.variables.currentNodeId = "";
    if (State.variables.lastFeedback == null) State.variables.lastFeedback = "";
    if (State.variables.errorMessage == null) State.variables.errorMessage = "";
    if (State.variables.answer == null) State.variables.answer = "";

    CQ.loadProgress();
  };

  CQ.firstId = function () {
    return CQ.order && CQ.order.length ? CQ.order[0] : "";
  };

  CQ.getNode = function (id) {
    return CQ.nodes ? CQ.nodes[id] : null;
  };

  CQ.checkAnswer = function (node, userInput) {
    if (!node) return false;
    var input = CQ.normalize(userInput);

    for (var i = 0; i < node.answers.length; i++) {
      var candidateRaw = node.answers[i];
      var candidate = CQ.normalize(candidateRaw);

      if (CQ.isDigitsOnly(candidate)) {
        if (CQ.fullwidthToHalfwidth(String(userInput)).trim() === candidate) {
          return true;
        }
      } else if (input === candidate) {
        return true;
      }
    }

    for (var r = 0; r < node.regexAnswers.length; r++) {
      var pattern = node.regexAnswers[r];
      try {
        var re = new RegExp(pattern);
        if (re.test(input)) return true;
      } catch (e) {
        // ignore invalid regex
      }
    }

    return false;
  };

  CQ.saveProgress = function () {
    try {
      localStorage.setItem(CQ.storageKeys.groupName, State.variables.groupName || "");
      localStorage.setItem(CQ.storageKeys.currentNodeId, State.variables.currentNodeId || "");
    } catch (e) {
      // ignore storage errors
    }
  };

  CQ.loadProgress = function () {
    try {
      var gn = localStorage.getItem(CQ.storageKeys.groupName);
      var cn = localStorage.getItem(CQ.storageKeys.currentNodeId);
      if (gn != null) State.variables.groupName = gn;
      if (cn != null) State.variables.currentNodeId = cn;
    } catch (e) {
      // ignore storage errors
    }
  };

  CQ.resetProgress = function () {
    try {
      localStorage.removeItem(CQ.storageKeys.groupName);
      localStorage.removeItem(CQ.storageKeys.currentNodeId);
    } catch (e) {
      // ignore storage errors
    }
    State.variables.groupName = "";
    State.variables.currentNodeId = "";
    State.variables.lastFeedback = "";
    State.variables.errorMessage = "";
    State.variables.answer = "";
  };

  setup.cq = CQ;
})();
