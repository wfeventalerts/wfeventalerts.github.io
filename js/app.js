const url = "https://api.warframestat.us/pc/"
let cacheControl = "force-cache"
let nearest = localStorage.getItem("nearest")

if (nearest == null) {
	cacheControl = "reload"
} else {
	let nearestTs = parseInt(nearest)
	let now = Date.now()

	if (now >= nearestTs) {
		cacheControl = "reload"
	}
}


fetch(url, { cache: cacheControl })
	.then((response) => {
		return response.json();
	})
	.then((data) => {
		let alerts = data.alerts;
		let container = document.getElementById("content")
		let missionsHTML = ``
		let now = Date.now()
		let prevTs = 0

		alerts.forEach(alert => {
			if (alert.tag == undefined || alert.tag != "JadeShadows") {
				return
			}

			let expiry = new Date(alert.expiry).valueOf()

			if (prevTs == 0 || prevTs > expiry) {
				prevTs = expiry
			} else {
				prevTs = prevTs
			}

			let mission = {
				start: alert.activation,
				end: alert.expiry,
				enemy: alert.mission.faction,
				type: alert.mission.type,
				location: alert.mission.node,
				reward: alert.mission.reward.asString
			}

			let missionBox = `
			 <div class="mission" data-start="${mission.start}" data-end="${mission.end}">
				<div class="container">
					<h4>${mission.enemy} - ${mission.type}</h4>
					<p>${mission.location}</p>
					<p>${mission.reward}</p>
					<p class="countdown-container"><span class="countdown"></span></p>
				</div>
			</div> 
			`
			missionsHTML += missionBox

		});

		localStorage.setItem("nearest", prevTs.toString())

		container.innerHTML = missionsHTML

		document.querySelectorAll(".mission").forEach(mission => {
			let start = mission.dataset.start
			let end = mission.dataset.end
			let endTime = new Date(end)

			simplyCountdown(mission.querySelector(".countdown"), {
				year: endTime.getFullYear(),
				month: endTime.getMonth() + 1,
				day: endTime.getDate(),
				hours: endTime.getHours(),
				minutes: endTime.getMinutes(),
				seconds: endTime.getSeconds(),
				inline: true,
				removeZeroUnits: true,
				zeroPad: false,
				inlineSeparator: ' ',
				words: {
					days: { root: 'd', lambda: (root, n) => n > 1 ? root + '' : root },
					hours: { root: 'h', lambda: (root, n) => n > 1 ? root + '' : root },
					minutes: { root: 'm', lambda: (root, n) => n > 1 ? root + '' : root },
					seconds: { root: 's', lambda: (root, n) => n > 1 ? root + '' : root }
				},
				onEnd: () => {
					mission.remove()
				}
			})
		})
	})
	.catch(function (error) {
		console.log(error);
	});