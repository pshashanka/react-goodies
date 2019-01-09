import React from 'react';
import { Label } from 'semantic-ui-react';
/**
 * AccordionPanels uses lazy loading approach for semantic-ui
 * Eg:
 *            <Accordion.Accordion
 *              activeIndex={this.state.activeIndex}
 *               panels={AccordionPanels(
 *               this.state.data,
 *               this.accordionTitle,
 *               this.accordionPanelContent,
 *               this.state.activeIndex,
 *               (e, item, index) => {
 *                 this.setState({ activeIndex: index });
 *               }
 *             )}
 *           />
 *
 * @param {*} data 
 * @param {*} accordionTitle 
 * @param {*} accordionPanelContent 
 * @param {*} activeIndex 
 * @param {*} onContentActivated 
 */
const AccordionPanels = (
  data,
  accordionTitle,
  accordionPanelContent,
  activeIndex = -1,
  onContentActivated = false
) => {
  const accordionPanels = [];

  const onTitleClick = (e, props, panel) => {
    if (!props.active) {
      const temp = panel.content.lazycontent;
      panel.content.content = temp.func.call(this, temp.item, temp.index);
      onContentActivated && onContentActivated(e, temp.item, temp.index);
    } else {
      onContentActivated && onContentActivated(e, null, -1);
    }
  };

  if (Array.isArray(data) && data.length > 0) {
    data.forEach((item, index) => {
      const panel = {};
      if (accordionTitle) {
        panel.title = {
          key: `title-${index}`,
          content: accordionTitle.call(this, item, index),
          onClick: (e, props) => onTitleClick(e, props, panel)
        };
      } else {
        panel.title = 'Title';
      }

      if (accordionPanelContent) {
        panel.content = {
          key: `content-${index}`,
          lazycontent: { func: accordionPanelContent, item, index },
          content:
            index === activeIndex ? (
              accordionPanelContent.call(this, item, index)
            ) : (
              <Label
                as="a"
                onClick={e => onTitleClick(e, { active: false }, panel)}
              >
                {' '}
                Update Data
              </Label>
            )
        };
      } else {
        panel.content = 'Content';
      }

      accordionPanels.push(panel);
    });
  }
  return accordionPanels;
};

export default AccordionPanels;
