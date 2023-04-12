import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {
  DataGeneratorService,
  DummyData,
} from 'src/app/data-generator.service';

enum ButtonEvent {
  Roll = 'Roll',
  Direction = 'Direction',
  Multi = 'Multi',
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
})
export class BarChartComponent implements OnInit {
  // data
  DataAll: DummyData[];

  // toolTip
  cuzToolTip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;

  constructor(private dataGen: DataGeneratorService) {
    this.DataAll = this.dataGen.generateDummyData();
  }

  ngOnInit(): void {
    // add button
    d3.select('#bar_chart_container')
      .append('button')
      .text('Multi')
      .attr(
        'style',
        'padding: 0.5rem 1rem; margin: 1rem; font-size:1rem;cursor:pointer'
      )
      .on('click', () => this.btnOnclick(ButtonEvent.Multi));

    // tooltip
    this.cuzToolTip = d3
      .select('body')
      .append('div')
      .style('top', 0)
      .style('left', 0)
      .style('border-radius', '0.5rem')
      .style('position', 'absolute')
      .style('display', 'flex')
      .style('justify-content', 'center')
      .style('align-items', 'center')
      .style('padding', '1rem')
      .style('width', '8rem')
      .style('height', 'auto')
      .style('background', 'black')
      .style('opacity', 0)
      .style('z-index', 10);
    const innerTable = this.cuzToolTip
      .append('table')
      .style('width', '100%')
      .style('border-spacing', '8px')
      .style('color', 'white')
      .style('font-size', '12px');
    const tr = innerTable.append('tr');
    tr.append('td')
      .style('width', '50%')
      .style('text-align', 'right')
      .style('white-space', 'normal')
      .style('word-break', 'break-all')
      .text('label');
    tr.append('td')
      .style('width', '50%')
      .style('text-align', 'left')
      .style('white-space', 'normal')
      .style('word-break', 'break-all')
      .text('value');
  }

  btnOnclick(e: ButtonEvent): void {
    const datum1 = this.dataGen.getData(this.DataAll, 'date', '2023-01-01');
    const datum2 = this.dataGen.getData(this.DataAll, 'date', '2023-01-02');
    const datum3 = this.dataGen.getData(this.DataAll, 'date', '2023-01-03');
    const datum4 = this.dataGen.getData(this.DataAll, 'date', '2023-01-04');
    const datum5 = this.dataGen.getData(this.DataAll, 'date', '2023-01-05');

    const testDataArray = [datum1, datum2, datum3, datum4, datum5];

    const container = document.getElementById('svg_multi_container');
    const svgWith = container ? container.offsetWidth / 2 : 0;

    if (e === ButtonEvent.Multi) {
      d3.selectAll('.innerContainer').remove();
      testDataArray.map((data) => {
        this.generateSVG(data, svgWith, 400, 30, 10);
      });
    } else {
      return;
    }
  }

  async generateSVG(
    datum: DummyData[],
    svgWidth: number,
    svgHeight: number,
    svgInnerMargin: number,
    svgTextGap: number,
    isTransition: boolean = true
  ): Promise<void> {
    if (datum.length == 0 || !datum) {
      return;
    }

    // Data
    for (let i in datum) {
      if (datum[i].value2 > datum[i].value) {
        datum[i].value2 = 0 - datum[i].value2;
      }
    }

    const innerWidth = svgWidth - svgInnerMargin * 2;
    const innerHeight = svgHeight / 2 - svgInnerMargin;
    const zeroLineX = svgHeight / 2;
    const transition = d3.transition().ease(d3.easeCubic).duration(1000);

    // generate scale method
    const scaleX = d3
      .scaleBand()
      .domain(datum.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.1);
    const scaleY = d3
      .scaleLinear()
      .domain([
        0 - (d3.max(datum.map((d) => d.value)) as number),
        d3.max(datum.map((d) => d.value)) as number,
      ])
      .range([innerHeight * 2, 0])
      .clamp(true)
      .nice();
    const colorScale = d3
      .scaleOrdinal()
      .domain(datum.map((d) => d.name))
      .range(this.dataGen.COLORSET);

    // create svg
    const innerContainer = d3
      .select('#svg_multi_container')
      .append('div')
      .attr('id', 'innerContainer')
      .style('display', 'inline-block')
      // .style('overflow-x', 'overlay')
      // .style('overflow-y', 'overlay')
      .style('position', 'relative');

    const svg = innerContainer
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .classed('innerContainer', true);

    // generate axis method
    const axisX = d3.axisBottom(scaleX);
    const axisXText = d3.axisBottom(scaleX);
    const axisY = d3.axisLeft(scaleY).ticks(10);
    // .tickSize(-this.dataGen.WIDTH + this.dataGen.INNER_MARGIN * 2);

    // draw rect
    const rect = svg
      .selectAll('rect')
      .data(datum)
      .join('rect')
      .attr('x', (d) => (scaleX(d.name) as number) + svgInnerMargin)
      .attr('y', (d) => zeroLineX)
      .attr('width', scaleX.bandwidth())
      .on('mouseover', (e) => {
        d3.select(e.target).attr('opacity', 0.6).attr('cursor', 'pointer');
      })
      .on('mousemove', (e) => {
        // tooltip calculate
        const toolTipRect = this.cuzToolTip.node()?.getBoundingClientRect();
        const width = toolTipRect?.width as number;
        const height = toolTipRect?.height as number;
        const offsetX = 20;
        const offsetY = -height / 2;

        const toopTipLocation = this.tooltipLocate(
          e,
          width,
          height,
          offsetX,
          offsetY
        );

        // tooltip location
        this.cuzToolTip
          .style('z-index', 10)
          .style('opacity', 0.8)
          .style('left', `${toopTipLocation[0]}px`)
          .style('top', `${toopTipLocation[1]}px`);
      })
      .on('mouseleave', (e) => {
        d3.select(e.target).attr('opacity', 1);
        this.cuzToolTip.style('opacity', 0).style('z-index', -10);
      });

    const rectInner = svg
      .selectAll('.rectInner')
      .data(datum)
      .join('rect')
      .attr(
        'x',
        (d) =>
          (scaleX(d.name) as number) + scaleX.bandwidth() / 4 + svgInnerMargin
      )
      .attr('y', (d) => zeroLineX)
      .attr('width', scaleX.bandwidth() / 2)
      .on('mouseover', (e) => {
        d3.select(e.target).attr('opacity', 1).attr('cursor', 'pointer');
      })
      .on('mouseleave', (e) => {
        d3.select(e.target).attr('opacity', 0.6);
      });

    // draw text on axisX
    const groupAxisXText = svg
      .append('g')
      .attr('transform', `translate(${svgInnerMargin},${zeroLineX})`)
      .call(axisXText)
      .selectAll('text')
      .data(datum)
      .join('text')
      .text((d) => 0)
      .attr('y', (d) => -svgTextGap);

    const groupAxisXTextInner = svg
      .append('g')
      .attr('transform', `translate(${svgInnerMargin},${zeroLineX})`)
      .call(axisXText)
      .selectAll('text')
      .data(datum)
      .join('text')
      .text((d) => 0)
      .attr('y', (d) => -svgTextGap);

    // draw axis
    svg
      .append('g')
      .attr('transform', `translate(${svgInnerMargin},${zeroLineX})`)
      .call(axisX);
    svg
      .append('g')
      .attr('transform', `translate(${svgInnerMargin},${svgInnerMargin})`)
      .call(axisY);

    /////////////////////////////
    // rect draw
    /////////////////////////////
    if (isTransition) {
      rect
        .transition(transition)
        .attr('y', (d) => scaleY(d.value) + svgInnerMargin)
        .attr('height', (d) => innerHeight - scaleY(d.value))
        .attr('fill', (d) => colorScale(d.name) as string);

      rectInner
        .transition(transition)
        .attr('y', (d) => {
          if (d.value2 < 0) {
            return zeroLineX;
          }
          return scaleY(d.value2) + svgInnerMargin;
        })
        .attr('height', (d) => {
          if (d.value2 < 0) {
            return scaleY(d.value2) - innerHeight;
          }
          return innerHeight - scaleY(d.value2);
        })
        .attr('fill', (d) => 'black')
        .attr('opacity', 0.6);

      groupAxisXText
        .transition(transition)
        .attr('y', (d) => scaleY(d.value) - innerHeight - svgTextGap)
        .tween('text', function (d) {
          let objThis = this as any;
          var i = d3.interpolate(objThis.textContent, d.value);
          return function (t) {
            d3.select(this).text((d) => d3.format('.0f')(i(t)));
          };
        });

      groupAxisXTextInner
        .transition(transition)
        .attr('y', (d) => {
          if (d.value2 < 0) {
            return scaleY(d.value2) - innerHeight + svgTextGap / 2;
          }
          return scaleY(d.value2) - innerHeight - svgTextGap;
        })
        .tween('text', function (d) {
          let objThis = this as any;
          if (isNaN(objThis.textContent)) {
            objThis.textContent = Number(objThis.textContent.replace('−', '-'));
          }
          var i = d3.interpolateNumber(objThis.textContent, d.value2);
          return function (t) {
            d3.select(this).text((d) => d3.format('.0f')(i(t)));
          };
        });
      ///////////////////////////////////
      // no transition animate
      ///////////////////////////////////
    } else if (!isTransition) {
      rect
        .attr('y', (d) => scaleY(d.value) + svgInnerMargin)
        .attr('height', (d) => innerHeight - scaleY(d.value))
        .attr('fill', (d) => colorScale(d.name) as string);

      rectInner
        .attr('y', (d) => {
          if (d.value2 < 0) {
            return zeroLineX;
          }
          return scaleY(d.value2) + svgInnerMargin;
        })
        .attr('height', (d) => {
          if (d.value2 < 0) {
            return scaleY(d.value2) - innerHeight;
          }
          return innerHeight - scaleY(d.value2);
        })
        .attr('fill', (d) => 'black')
        .attr('opacity', 0.6);

      groupAxisXText
        .attr('y', (d) => scaleY(d.value) - innerHeight - svgTextGap)
        .text((d) => d.value);

      groupAxisXTextInner
        .attr('y', (d) => {
          if (d.value2 < 0) {
            return scaleY(d.value2) - innerHeight + svgTextGap / 2;
          }
          return scaleY(d.value2) - innerHeight - svgTextGap;
        })
        .text((d) => d.value);
    }
  }

  tooltipLocate(
    e: MouseEvent,
    width: number,
    height: number,
    offsetX: number,
    offsetY: number
  ): number[] {
    const MARGIN = 16;

    let outputX = 0;
    let outputY = 0;

    outputX =
      e.clientX + width + offsetX > window.innerWidth - MARGIN
        ? e.pageX - width - offsetX
        : e.pageX + offsetX;
    outputY =
      e.clientY + height + offsetY > window.innerHeight - MARGIN
        ? e.pageY - height
        : e.clientY - height - offsetY < 0
        ? e.pageY
        : e.pageY + offsetY;

    return [outputX, outputY];
  }
}
