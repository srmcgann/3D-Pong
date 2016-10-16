<script>
	const currentFrame = function(start){ var _ = start; return function(){ ++_; }; };

	const gameUpdate = currentFrame(0);

	f = gameUpdate();
	document.write(f+"<br>");

	f = gameUpdate();
	document.write(f+"<br>");

	f = gameUpdate();
	document.write(f+"<br>");

</script>