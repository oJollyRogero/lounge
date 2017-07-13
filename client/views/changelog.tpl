{{#if latest}}
<a href="{{latest.url}}" target="_blank" rel="noopener" class="changelog-version changelog-version-new">
	The Lounge <b>{{latest.version}}</b>{{#if latest.prerelease}} (pre-release){{/if}} is now available.
	Click to view details on GitHub.
</a>
{{else if current.changelog}}
<div class="changelog-version">
	The Lounge is up to date!
</div>
{{/if}}

{{#if gitCommit}}
	<p>The Lounge is running from source (commit <a href="https://github.com/thelounge/lounge/tree/{{gitCommit}}" target="_blank" rel="noopener"><code>{{gitCommit}}</code></a>) based on <strong>{{current.version}}</strong></p>
	<p><a href="https://github.com/thelounge/lounge/compare/{{gitCommit}}...master" target="_blank" rel="noopener">Compare changes between <code>{{gitCommit}}</code> and <code>master</code> to see what you are missing</a></p>
	<p><a href="https://github.com/thelounge/lounge/compare/{{current.version}}...{{gitCommit}}" target="_blank" rel="noopener">Compare changes between <code>{{current.version}}</code> and <code>{{gitCommit}}</code> to see the changes made</a></p>
{{else}}
	<p>The Lounge is running <a href="https://github.com/thelounge/lounge/releases/tag/{{current.version}}" target="_blank" rel="noopener"><strong>{{current.version}}</strong></a></p>
{{/if}}

{{#if current.changelog}}
	<h3>Changelog for {{current.version}}</h3>

	<div class="changelog-text">{{{current.changelog}}}</div>
{{else}}
	<hr>
	<p>Unable to retrieve releases from GitHub.</p>
	<p><a href="https://github.com/thelounge/lounge/releases/tag/{{current.version}}" target="_blank" rel="noopener">View release notes for this version on GitHub</a></p>
{{/if}}
