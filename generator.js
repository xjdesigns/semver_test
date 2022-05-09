'use strict';
const fs = require('fs');
const baseLink = 'https://bofcmportal.atlassian.net/browse/'
let version = ''
let title = ''

function fileData() {
	fs.readFile(`${__dirname}/CHANGELOG_TESTINGOUTPUT.md`, 'utf8', (err, data) => {
		if (err) {
			console.error('err', err)
			return;
		}

		if (data) {
			createTitle(data)
			const issues = getCommitsFromVersion(data)
			const issuesWLinks = createLinks(issues)
			createOutputFile(issuesWLinks)
		} else {
			console.error('No data from file')
		}
	})
}

function createTitle(data) {
	const headerRegex = /#([\s\S]*?)\n/g;
	const header = data.match(headerRegex)
	title = header[0]
}

function getCommitsFromVersion(data) {
	const versionRegex = /\d.\d.\d/g
	const versions = data.match(versionRegex)
	// RegExp for \s\S needs additional slash as being stripped
	version = versions[0]
	const allCommitsRegex = RegExp(versions[0] + '([\\s\\S]*?)\]', 'gm')
	const allCommits = data.match(allCommitsRegex)
	const commitRegex = /\*\*([\s\S]*?)\n/g
	const issues = []

	for (let i = 0; i < allCommits.length; i++) {
		const match = allCommits[i].match(commitRegex)

		if (match && match.length > 0) {
			for (let m = 0; m < match.length; m++) {
				issues.push(match[m])
			}
		}
	}

	return issues;
}

function createLinks(issues) {
	const output = []
	const WDFRegex = /([a-zA-Z]+(-[0-9]+)+)/g

	for (let i = 0; i < issues.length; i++) {
		const issue = {
			title: `• ${issues[i]}`
		}
		
		if (WDFRegex.test(issues[i])) {
			const match = issues[i].match(WDFRegex)
			issue['link'] = `[[${match[0]}]](${baseLink}${match[0]})`
		}

		output.push(issue)
	}

	return output
}

function createOutputFile(data) {
	let outski = `${title}${version}\n${data.map(d => {
		if (d.link) {
			return d.title + d.link + '\n\n'
		}
		return d.title + '\n'
	})}`;
	outski = outski.replace(/,/g, '')
	outski = outski.replace(/\*\*/g, '')
	console.warn('outski', outski);

	fs.writeFile(`${__dirname}/outski.txt`, outski, err => {
		if (err) console.error('failed to write')
	})
}

// worker
// #{2}[^\n]*\n([\s\S]*?)#{2}

// capture first version #
// \d.\d.\d
// then capture starting with that
// 1.3.0([\s\S]*?)\]
// from there capture lines and if they match a pattern such as 'WDF-' append to provided url
// \*\*([\s\S]*?)\n

// NOTE: need to test a multi line desciption commit

fileData()
