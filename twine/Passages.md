# CourseQuest Passages (SugarCube)

Create the following passages in Twine (SugarCube 2). Copy the content exactly.

## StoryInit (special)
```
<<run setup.cq.init()>>
```

## Start
```
<div class="cq-shell">
  <div class="cq-title"><<print (setup.cq.meta && setup.cq.meta.title) ? setup.cq.meta.title : "CourseQuest">></div>
  <div class="cq-subtitle">請輸入小組名稱開始任務</div>

  <div>小組名稱</div>
  <input id="cq-group" class="cq-input" value="">

  <<button "開始任務">>
    <<set $groupName = $('#cq-group').val().trim()>>
    <<if $groupName.length > 0>>
      <<run setup.cq.resetProgressForGroup($groupName)>>
      <<run setup.cq.ensureStartTime()>>
      <<set $currentNodeId = setup.cq.firstId()>>
      <<set $errorMessage = "">>
      <<set $lastFeedback = "">>
      <<run setup.cq.saveProgress()>>
      <<goto "S1">>
    <<else>>
      <<set $errorMessage = "請輸入小組名稱。">>
    <</if>>
  <</button>>

  <<if $currentNodeId>>
    <<button "繼續上次進度">>
      <<run setup.cq.saveProgress()>>
      <<goto "Gate">>
    <</button>>
  <</if>>

  <<if $errorMessage>>
    <div class="cq-error"><<print $errorMessage>></div>
  <</if>>
</div>
```

## S1
```
<div class="cq-shell">
  <div class="cq-title">冒險開始</div>
  <div class="cq-subtitle"><<print $groupName>> 你好！</div>

  <div class="cq-prompt">
    我是考古小偵探。感謝您來到考古的世界😉<br>
    我是考古小偵探，是來幫助你尋找消失的城市的！🔍<br>
    請拿出你的智慧與勇氣，尋找消失的寶藏吧! 💰
  </div>

  <<button "走進三星堆">>
    <<set $currentNodeId = "S2">>
    <<run setup.cq.saveProgress()>>
    <<goto "Gate">>
  <</button>>
</div>
```

## Gate
```
<<set _node = setup.cq.getNode($currentNodeId)>>
<<if _node>>
  <<set _wasCompleted = $completedIds.includes(_node.id)>>
  <<run setup.cq.markCompleted(_node.id)>>
  <<set _displayHTML = _node.promptHTML>>
  <<if setup.cq.isGoal(_node.id) && _wasCompleted && _node.revisitHTML>>
    <<set _displayHTML = _node.revisitHTML>>
  <</if>>
<</if>>
<div class="cq-shell">
  <div class="cq-title">任務進行中</div>
  <div class="cq-subtitle">小組：<<print $groupName>></div>

  <<if !_node>>
    <div class="cq-error">找不到題目，請確認 ContentCSV 是否正確。</div>
  <<else>>
    <div class="cq-prompt"><<print _displayHTML>></div>

    <<if _node.id == "S8">>
      <div class="cq-feedback">你沒有找到線索，只好整理錯誤證據後再出發。</div>
      <button id="cq-s8-btn" class="cq-button" disabled>回到石板</button>
      <<script>>
        setTimeout(function () {
          var btn = document.getElementById("cq-s8-btn");
          if (!btn) return;
          btn.disabled = false;
          btn.addEventListener("click", function () {
            State.variables.currentNodeId = "S2";
            setup.cq.saveProgress();
            Engine.play("Gate");
          });
        }, 1200);
      <</script>>
    <<elseif setup.cq.isGoal(_node.id)>>
      <<if _wasCompleted>>
        <div class="cq-feedback">你已經來過這裡，記得要繼續前進喔！</div>
      <<else>>
        <div class="cq-feedback">恭喜你找到線索！繼續探索吧！</div>
      <</if>>
      <<button "繼續探索">>
        <<set $currentNodeId = "S2">>
        <<if setup.cq.allGoalsCompleted()>>
          <<set $currentNodeId = "">>
          <<run setup.cq.finishTimer()>>
          <<run setup.cq.saveProgress()>>
          <<goto "End">>
        <<else>>
          <<run setup.cq.saveProgress()>>
          <<goto "Gate">>
        <</if>>
      <</button>>
    <<else>>
      <input id="cq-answer" class="cq-input" value="">

      <<button "送出">>
        <<set $answer = $('#cq-answer').val()>>
        <<set _result = setup.cq.checkAnswer(_node, $answer)>>
        <<if _result.ok>>
          <<set $errorMessage = "">>
          <<set $lastFeedback = _result.onSuccessHTML>>
          <<if _result.nextId>>
            <<set $currentNodeId = _result.nextId>>
            <<if $currentNodeId == "S2" && setup.cq.allGoalsCompleted()>>
              <<set $currentNodeId = "">>
              <<run setup.cq.saveProgress()>>
              <<goto "End">>
            <<else>>
              <<run setup.cq.saveProgress()>>
              <<goto "Gate">>
            <</if>>
          <<else>>
            <<run setup.cq.saveProgress()>>
            <<goto "End">>
          <</if>>
        <<else>>
          <<set $errorMessage = setup.cq.config.wrongMessage>>
        <</if>>
      <</button>>
    <</if>>

    <<button "重新開始" "secondary">>
      <<run setup.cq.resetProgress()>>
      <<goto "Start">>
    <</button>>

    <<if $lastFeedback>>
      <div class="cq-feedback"><<print $lastFeedback>></div>
      <<set $lastFeedback = "">>
    <</if>>

    <<if $errorMessage>>
      <div class="cq-error"><<print $errorMessage>></div>
    <</if>>

    <<set _index = setup.cq.order.indexOf(_node.id) + 1>>
    <<set _total = setup.cq.order.length>>
    <div class="cq-progress">第 <<print _index>> / <<print _total>> 關</div>
  <</if>>
</div>
```

## End
```
<div class="cq-shell">
  <div class="cq-title">任務完成！</div>
  <div class="cq-subtitle">辛苦了，<<print $groupName>>！</div>
  <div class="cq-prompt">你們已通關，請等待下一指令。</div>
  <div class="cq-feedback">完成時間：<<print setup.cq.formatDuration(setup.cq.getElapsedMs())>></div>

  <<button "重新開始">>
    <<run setup.cq.resetProgress()>>
    <<goto "Start">>
  <</button>>
</div>
```

## ContentCSV
Paste the content from `content.csv` here.
