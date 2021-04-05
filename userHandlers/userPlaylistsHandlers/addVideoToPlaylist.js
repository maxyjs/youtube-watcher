async function addVideoToPlaylist(instanceBrowser, id, addPlaylistMark) {
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;
  await instanceBrowser.page.setDefaultTimeout(30000);
  await instanceBrowser.page.goto(videoUrl);
  await instanceBrowser.page.waitFor(4000);

  if (await detectViewedVideo(instanceBrowser.page)) {
    return {
      isSuccessfullyAdded: false,
      id,
      videoUrl,
      message: 'Video already viewed',
    };
  }

  const result = await instanceBrowser.page.evaluate(
    async (addPlaylistMark, id, videoUrl) => {
      try {
        const saveVideoButton = document.querySelector(
          '#top-level-buttons > ytd-button-renderer:nth-child(4) > a'
        );
        saveVideoButton.click();

        await sleep(3000);

        const playlistsElem = document.querySelector(
          '#playlists.style-scope.ytd-add-to-playlist-renderer'
        );
        const paperCheckboxes = [
          ...playlistsElem.querySelectorAll(
            '#checkbox.style-scope.ytd-playlist-add-to-option-renderer'
          ),
        ];
        const targetPaperCheckbox = await getTargetPaperCheckbox(
          playlistsElem,
          paperCheckboxes,
          addPlaylistMark
        );

        if (targetPaperCheckbox) {
          const isChecked = targetPaperCheckbox.checked;
          if (isChecked) {
            return {
              isSuccessfullyAdded: true,
              id,
              videoUrl,
              message: 'Video already added',
            };
          } else {
            targetPaperCheckbox.click();
            return {
              isSuccessfullyAdded: true,
              id,
              videoUrl,
              message: 'Video successfully added',
            };
          }
        } else {
          return {
            isSuccessfullyAdded: false,
            id,
            videoUrl,
            message: 'ERROR: Not found element targetPlaylist',
          };
        }
      } catch (err) {
        return {
          isSuccessfullyAdded: false,
          id,
          videoUrl,
          message: err.message,
        };
      }

      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      async function getTargetPaperCheckbox(
        playlistsElem,
        paperCheckboxes,
        addPlaylistMark
      ) {
        let checkbox = _getCheckbox(paperCheckboxes, addPlaylistMark);

        if (!checkbox) {
          return null;
        } else {
          return checkbox;
        }

        function _getCheckbox(paperCheckboxes, addPlaylistMark) {
          const targetPaperCheckbox = paperCheckboxes.find((paperCheckbox) => {
            return paperCheckbox.innerText.includes(addPlaylistMark);
          });
          return targetPaperCheckbox;
        }
      }
    },
    addPlaylistMark,
    id,
    videoUrl
  );

  return result;

  async function detectViewedVideo(page) {
    let result = false;

    result = await page.evaluate(async () => {
      const buttonsAll = [
        ...document.querySelectorAll('#button.style-scope.yt-icon-button'),
      ];

      const targetBts = buttonsAll.filter((b) => {
        return b.ariaLabel && b.ariaLabel.includes('Видео');
      });

      const $like = targetBts[0];
      const $dislike = targetBts[1];

      if ($like && $like['ariaPressed'] === 'true') {
        return true;
      }

      if ($dislike && $dislike['ariaPressed'] === 'true') {
        return true;
      }

      return false;
    });

    return result;
  }
}

module.exports = addVideoToPlaylist;
