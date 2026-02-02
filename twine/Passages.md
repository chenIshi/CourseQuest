# CourseQuest Passages (SugarCube)

Create the following passages in Twine (SugarCube 2). Copy the content exactly.

## StoryInit (special)
```
<<run setup.cq.init()>>
```

## Start
```
<div class="cq-shell">
  <div class="cq-title">CourseQuest</div>
  <div class="cq-subtitle">請輸入小組名稱開始任務</div>

  <div>小組名稱</div>
  <input id="cq-group" class="cq-input" placeholder="輸入小組名稱" value="<<print $groupName>>">

  <<button "開始任務">>
    <<set $groupName = $('#cq-group').val().trim()>>
    <<if $groupName.length > 0>>
      <<set $currentNodeId = setup.cq.firstId()>>
      <<set $errorMessage = "">>
      <<set $lastFeedback = "">>
      <<run setup.cq.saveProgress()>>
      <<goto "Gate">>
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

## Gate
```
<<set _node = setup.cq.getNode($currentNodeId)>>
<div class="cq-shell">
  <div class="cq-title">任務進行中</div>
  <div class="cq-subtitle">小組：<<print $groupName>></div>

  <<if !_node>>
    <div class="cq-error">找不到題目，請確認 ContentCSV 是否正確。</div>
  <<else>>
    <div class="cq-prompt"><<print _node.promptHTML>></div>

    <input id="cq-answer" class="cq-input" placeholder="<<print _node.inputPlaceholder>>" value="">

    <<button "送出">>
      <<set $answer = $('#cq-answer').val()>>
      <<if setup.cq.checkAnswer(_node, $answer)>>
        <<set $errorMessage = "">>
        <<set $lastFeedback = _node.onSuccessHTML>>
        <<if _node.nextId>>
          <<set $currentNodeId = _node.nextId>>
          <<run setup.cq.saveProgress()>>
          <<goto "Gate">>
        <<else>>
          <<run setup.cq.saveProgress()>>
          <<goto "End">>
        <</if>>
      <<else>>
        <<set $errorMessage = setup.cq.config.wrongMessage>>
      <</if>>
    <</button>>

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

  <<button "重新開始">>
    <<run setup.cq.resetProgress()>>
    <<goto "Start">>
  <</button>>
</div>
```

## ContentCSV
Paste the content from `content.csv` here.
