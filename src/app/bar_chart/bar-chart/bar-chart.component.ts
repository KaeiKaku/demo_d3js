import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {
  DataGeneratorService,
  DummyData,
} from 'src/app/data-generator.service';

enum ButtonEvent {
  Roll = 'Roll',
  Loop = 'Loop',
  Direction = 'Direction',
}

type d3Rect = d3.Selection<
  d3.BaseType | SVGRectElement,
  DummyData,
  SVGSVGElement,
  unknown
>;

type d3Text = d3.Selection<
  d3.BaseType | SVGTextElement,
  DummyData,
  SVGGElement,
  unknown
>;

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
})
export class BarChartComponent implements OnInit {
  // triger
  onloop: boolean = false;
  onStoppingLoop: boolean = false;

  // data
  DataAll: DummyData[];
  DataCY: DummyData[] = [];
  DataAofCY: DummyData[] = [];

  // svg element
  rect: d3Rect;
  rectInner: d3Rect;
  groupAxisXText: d3Text;
  groupAxisXTextInner: d3Text;
  innerWidth: number;
  innerHeight: number;
  textGap: number = 10;

  scaleX: d3.ScaleBand<string>;
  scaleY: d3.ScaleLinear<number, number, never>;
  colorScale: d3.ScaleOrdinal<string, unknown, never>;

  constructor(private dataGen: DataGeneratorService) {
    this.DataAll = this.dataGen.generateDummyData();
    this.DataCY = this.dataGen.getData(this.DataAll, 'date', '2023-01-01');
    this.DataAofCY = this.dataGen.getData(this.DataAll, 'name', 'A');
    this.innerWidth = this.dataGen.WIDTH - this.dataGen.INNER_MARGIN * 2;
    this.innerHeight = this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN * 2;

    // generate scale method
    this.scaleX = d3
      .scaleBand()
      .domain(this.DataCY.map((d) => d.name))
      .range([0, this.innerWidth])
      .padding(0.1);
    this.scaleY = d3
      .scaleLinear()
      .domain([0, d3.max(this.DataCY.map((d) => d.value)) as number])
      .range([this.innerHeight, 0])
      .clamp(true)
      .nice();
    this.colorScale = d3
      .scaleOrdinal()
      .domain(this.DataCY.map((d) => d.name))
      .range(this.dataGen.COLORSET);
  }

  ngOnInit(): void {
    // add button
    d3.select('#bar_chart_container')
      .append('button')
      .text('Roll')
      .attr(
        'style',
        'padding: 0.5rem 1rem; margin: 1rem; font-size:1rem;cursor:pointer'
      )
      .on('click', () => this.btnOnclick(ButtonEvent.Roll));

    d3.select('#bar_chart_container')
      .append('button')
      .text('Loop')
      .attr(
        'style',
        'padding: 0.5rem 1rem; margin: 1rem; font-size:1rem;cursor:pointer'
      )
      .on('click', () => this.btnOnclick(ButtonEvent.Loop));

    // add main svg
    const svg = d3
      .select('#bar_chart_container')
      .append('svg')
      .attr('width', this.dataGen.WIDTH)
      .attr('height', this.dataGen.HEIGHT)
      .classed('border', true);

    // generate axis method
    const axisX = d3.axisBottom(this.scaleX);
    const axisXText = d3.axisBottom(this.scaleX);
    const axisY = d3.axisLeft(this.scaleY).ticks(20);
    // .tickSize(-this.dataGen.WIDTH + this.dataGen.INNER_MARGIN * 2);

    // draw rect
    this.rect = svg
      .selectAll('rect')
      .data(this.DataCY)
      .join('rect')
      .attr(
        'x',
        (d) => (this.scaleX(d.name) as number) + this.dataGen.INNER_MARGIN
      )
      .attr('y', (d) => this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN)
      .attr('width', this.scaleX.bandwidth());

    this.rectInner = svg
      .selectAll('.rectInner')
      .data(this.DataCY)
      .join('rect')
      .attr(
        'x',
        (d) =>
          (this.scaleX(d.name) as number) +
          this.scaleX.bandwidth() / 4 +
          this.dataGen.INNER_MARGIN
      )
      .attr('y', (d) => this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN)
      .attr('width', this.scaleX.bandwidth() / 2);

    // draw text on axisX
    this.groupAxisXText = svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dataGen.INNER_MARGIN},${
          this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN
        })`
      )
      .call(axisXText)
      .selectAll('text')
      .data(this.DataCY)
      .join('text')
      .text((d) => 0)
      .attr('y', (d) => -this.textGap);

    this.groupAxisXTextInner = svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dataGen.INNER_MARGIN},${
          this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN
        })`
      )
      .call(axisXText)
      .selectAll('text')
      .data(this.DataCY)
      .join('text')
      .text((d) => 0)
      .attr('y', (d) => -this.textGap);

    // draw axis
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dataGen.INNER_MARGIN},${
          this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN
        })`
      )
      .call(axisX);
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dataGen.INNER_MARGIN},${this.dataGen.INNER_MARGIN})`
      )
      .call(axisY);
  }

  async btnOnclick(e: ButtonEvent): Promise<void> {
    // this.onloop = false;
    if (e === ButtonEvent.Roll && !this.onloop && !this.onStoppingLoop) {
      this.onStoppingLoop = true;
      // random dummy data
      this.DataCY.forEach((d) => {
        d.value = d3.randomInt(1000000)();
        d.value2 = d3.randomInt(1000000)();
      });
      await this.renderTransition().finally(
        () => (this.onStoppingLoop = false)
      );
    } else if (e === ButtonEvent.Loop) {
      this.onloop = this.onloop ? false : true;
      if (!this.onloop) this.onStoppingLoop = true;
      while (this.onloop) {
        this.DataCY.forEach((d) => {
          d.value = d3.randomInt(1000000)();
          d.value2 = d3.randomInt(1000000)();
        });
        await this.renderTransition().finally(
          () => (this.onStoppingLoop = false)
        );
      }
    } else {
      return;
    }
  }

  async renderTransition(): Promise<void> {
    const transition = d3.transition().ease(d3.easeCubic).duration(2000);

    this.rect
      .transition(transition)
      .attr('y', (d) => this.scaleY(d.value) + this.dataGen.INNER_MARGIN)
      .attr('height', (d) => this.innerHeight - this.scaleY(d.value))
      .attr('fill', (d) => this.colorScale(d.name) as string);

    this.rectInner
      .transition(transition)
      .attr('y', (d) => this.scaleY(d.value2) + this.dataGen.INNER_MARGIN)
      .attr('height', (d) => this.innerHeight - this.scaleY(d.value2))
      .attr('fill', (d) => 'black')
      .attr('opacity', 0.6);

    this.groupAxisXText
      .transition(transition)
      .attr('y', (d) => this.scaleY(d.value) - this.innerHeight - this.textGap)
      .tween('text', function (d) {
        let objThis = this as any;
        var i = d3.interpolate(objThis.textContent, d.value);
        return function (t) {
          d3.select(this).text((d) => d3.format('.0f')(i(t)));
        };
      });

    this.groupAxisXTextInner
      .transition(transition)
      .attr('y', (d) => this.scaleY(d.value2) - this.innerHeight - this.textGap)
      .tween('text', function (d) {
        let objThis = this as any;
        var i = d3.interpolate(objThis.textContent, d.value2);
        return function (t) {
          d3.select(this).text((d) => d3.format('.0f')(i(t)));
        };
      });
    await transition.end();
  }
}
