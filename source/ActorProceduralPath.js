import ActorNode from "./ActorNode.js";
import {vec2} from "gl-matrix";
import Graphics from "./Graphics.js";
import ActorPath from "./ActorPath.js";

export default class ActorProceduralPath extends ActorNode
{
    constructor(actor)
    {
        super(actor);
        this._Width = 0;
        this._Height = 0;
        this._RenderPath = null;
        this._RenderPathDirty = true;
    }

    initialize(actor, graphics)
	{
		this._RenderPath = graphics.makePath();
    }
    
	invalidatePath()
	{
		this._IsRenderPathDirty = true;
		this._RenderPath.setIsVolatile(true);
		this.parent.invalidatePath();
	}
    
    get width()
    {
        return this._Width;
    }

    set width(value)
    {
        if(this._Width === value)
        {
            return;
        }
        this._Width = value;
        this.invalidatePath();
    }

    get height()
    {
        return this._Height;
    }

    set height(value)
    {
        if(this._Height === value)
        {
            return;
        }
        this._Height = value;
        this.invalidatePath();
    }
    
    resolveComponentIndices(components)
	{
        ActorNode.prototype.resolveComponentIndices.call(this, components);
    }
 
    makeInstance(resetActor)
    {
        const node = ActorProceduralPath();
        ActorProceduralPath.prototype.copy.call(node, this, resetActor);
        return node;
    }

    getPathTransform()
	{
        return this._WorldTransform;
    }
    
    getPathRenderTransform()
	{
		return this.worldTransform;
    }
    
    getPath(graphics)
	{
		let {_RenderPathDirty, _RenderPath} = this;
		if(!_RenderPathDirty)
		{
			return _RenderPath;
		}
		if(!_RenderPath)
		{
			this._RenderPath = _RenderPath = graphics.makePath();
		}
		else
		{
			_RenderPath.rewind();
		}
		this._RenderPathDirty = false;

		return Graphics.pointPath(_RenderPath, ActorPath.makeRenderPoints(this.getPathPoints(), true), true);
	}

    getPathAABB()
    {
        let min_x = Number.MAX_VALUE;
        let min_y = Number.MAX_VALUE;
        let max_x = Number.MIN_VALUE;
        let max_y = Number.MIN_VALUE;

        const transform = this._Transform;
        function addPoint(point)
        {
            if(transform)
            {
                point = vec2.transformMat2d(vec2.create(), point, transform);
            }

            if(point[0] < min_x)
			{
				min_x = point[0];
			}
			if(point[1] < min_y)
			{
				min_y = point[1];
			}
			if(point[0] > max_x)
			{
				max_x = point[0];
			}
			if(point[1] > max_y)
			{
				max_y = point[1];
			}
        }

        const radiusX = this._Width/2;
        const radiusY = this._Height/2;
        addPoint([-radiusX, -radiusY]);
        addPoint([radiusX, -radiusY]);
        addPoint([-radiusX, radiusY]);
        addPoint([radiusX, radiusY]);

        return [min_x, min_y, max_x, max_y];
    }

    copy(node, resetActor)
    {
        super.copy(node, resetActor);

        this._Width = node._Width;
        this._Height = node._Height;
    }
}