import PipelineStage from '../PipelineStage';
import FeedbackService from '../../../../services/feedback/FeedbackService';

export default class FeedbackStage extends PipelineStage {
  constructor() {
    super('FeedbackStage');
  }

  async execute(context) {
    // Como este estágio só é alcançado em SUCCESS
    FeedbackService.triggerSuccess();
  }
}
